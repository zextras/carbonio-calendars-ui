/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { noop } from 'lodash';

import { printAppointment } from './print-appointment';
import { PRINT_PAGE_CSP } from './print-document';
import { getInvite } from 'store/actions/get-invite';
import mockedData from 'test/generators';
import { ActionsContext } from 'types/actions';

vi.mock('store/actions/get-invite', async (importOriginal) => {
	const actual = await importOriginal<typeof import('store/actions/get-invite')>();
	// keep the thunk action creators (fulfilled, rejected...) used to match the result
	return { getInvite: Object.assign(vi.fn(actual.getInvite), actual.getInvite) };
});

type FakeWindow = {
	document: Document;
	opener: unknown;
	closed: boolean;
	focus: ReturnType<typeof vi.fn>;
	print: ReturnType<typeof vi.fn>;
};

// jest-dom matchers reject nodes of another document realm, so read the text directly
const bodyText = (win: FakeWindow): string | null => win.document.body.textContent;

const fakeWindow = (): FakeWindow => ({
	document: document.implementation.createHTMLDocument(''),
	opener: window,
	closed: false,
	focus: vi.fn(),
	print: vi.fn()
});

const message = {
	id: '321-320',
	inv: [
		{
			comp: [
				{
					name: '<img src=x onerror="window.pwned()">Sprint review',
					loc: 'Room Blu',
					or: { a: 'org@gmail.example', d: 'Ext Organizer' },
					at: [{ a: 'user@example.com', d: 'User', role: 'REQ', ptst: 'NE' }],
					desc: [{ _content: 'Agenda <script>window.pwned()</script>' }]
				}
			]
		}
	]
};

const setup = ({
	dispatchResult
}: {
	dispatchResult: Promise<unknown>;
}): { context: ActionsContext; dispatch: ReturnType<typeof vi.fn> } => {
	const dispatch = vi.fn(() => dispatchResult);
	const context = {
		dispatch,
		createSnackbar: vi.fn()
	} as unknown as ActionsContext;
	return { context, dispatch };
};

const event = mockedData.getEvent({ resource: { inviteId: '321-320', ridZ: '20261201T130000Z' } });

describe('printAppointment', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('opens the tab synchronously, cuts the opener and fetches the clicked occurrence', () => {
		const win = fakeWindow();
		const open = vi.spyOn(window, 'open').mockReturnValue(win as unknown as Window);
		const { context, dispatch } = setup({ dispatchResult: new Promise(noop) });

		printAppointment({ event, context })();

		expect(open).toHaveBeenCalledWith('', '_blank');
		expect(win.opener).toBeNull();
		expect(dispatch).toHaveBeenCalledTimes(1);
		expect(getInvite).toHaveBeenCalledWith({ inviteId: '321-320', ridZ: '20261201T130000Z' });
	});

	it('renders the appointment as text and prints it', async () => {
		const pwned = vi.fn();
		vi.stubGlobal('pwned', pwned);
		const win = fakeWindow();
		vi.spyOn(window, 'open').mockReturnValue(win as unknown as Window);
		const arg = { inviteId: '321-320' };
		const { context } = setup({
			dispatchResult: Promise.resolve(getInvite.fulfilled({ m: [message] }, 'request', arg))
		});

		printAppointment({ event, context })();

		await vi.waitFor(() => expect(win.print).toHaveBeenCalledTimes(1));
		const doc = win.document;
		expect((doc.head.firstElementChild as HTMLMetaElement).content).toBe(PRINT_PAGE_CSP);
		expect(doc.querySelector('h1')?.textContent).toBe(
			'<img src=x onerror="window.pwned()">Sprint review'
		);
		expect(doc.querySelector('.description')?.textContent).toBe(
			'Agenda <script>window.pwned()</script>'
		);
		expect(doc.querySelectorAll('script, img')).toHaveLength(0);
		expect(pwned).not.toHaveBeenCalled();
		expect(win.focus).toHaveBeenCalled();
	});

	it('shows an error in the tab and does not print when the invite cannot be loaded', async () => {
		const win = fakeWindow();
		vi.spyOn(window, 'open').mockReturnValue(win as unknown as Window);
		const { context } = setup({
			dispatchResult: Promise.resolve(
				getInvite.rejected(new Error('fault'), 'request', { inviteId: '321-320' })
			)
		});

		printAppointment({ event, context })();

		await vi.waitFor(() => expect(bodyText(win)).toBe('label.error_try_again'));
		expect(win.print).not.toHaveBeenCalled();
	});

	it('does nothing when the user closed the tab before the invite arrived', async () => {
		const win = fakeWindow();
		vi.spyOn(window, 'open').mockReturnValue(win as unknown as Window);
		let resolveDispatch: (value: unknown) => void = noop;
		const { context } = setup({
			dispatchResult: new Promise((resolve) => {
				resolveDispatch = resolve;
			})
		});

		// reading closed proves the guard ran, so the assertions below are not vacuous
		const closedRead = vi.fn(() => true);
		Object.defineProperty(win, 'closed', { get: closedRead });

		printAppointment({ event, context })();
		resolveDispatch(getInvite.fulfilled({ m: [message] }, 'request', { inviteId: '321-320' }));
		await vi.waitFor(() => expect(closedRead).toHaveBeenCalled());

		expect(win.document.querySelector('h1')).toBeNull();
		expect(win.print).not.toHaveBeenCalled();
	});

	it('warns about the pop-up blocker and fetches nothing when the tab cannot open', () => {
		vi.spyOn(window, 'open').mockReturnValue(null);
		const { context, dispatch } = setup({ dispatchResult: Promise.resolve() });

		printAppointment({ event, context })();

		expect(context.createSnackbar).toHaveBeenCalledWith(
			expect.objectContaining({ severity: 'warning', label: 'message.print_popup_blocked' })
		);
		expect(dispatch).not.toHaveBeenCalled();
	});
});
