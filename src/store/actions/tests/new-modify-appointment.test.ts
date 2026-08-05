/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ONE_MB, QuotaChangedEvent } from '../../../event-bus/quota-changed';
import { normalizeSoapMessageFromEditor } from '../../../normalizations/normalize-soap-message-from-editor';
import { Editor } from '../../../types/editor';
import { modifyAppointment } from '../new-modify-appointment';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

vi.mock('../../../normalizations/normalize-soap-message-from-editor', () => ({
	normalizeSoapMessageFromEditor: vi.fn(() => ({}))
}));

const buildEditor = (overrides: Partial<Editor>): Editor =>
	({
		id: 'editor-id',
		attachmentFiles: [],
		recur: undefined,
		isSeries: false,
		isInstance: false,
		isException: false,
		allDay: false,
		timezone: 'UTC',
		originalStart: Date.now(),
		plainText: 'text',
		attendees: [],
		optionalAttendees: [],
		...overrides
	}) as unknown as Editor;

const runThunk = async (
	editor: Editor,
	getState: () => any = vi.fn(() => undefined)
): Promise<void> => {
	const thunk = modifyAppointment({ draft: true, editor });
	await thunk(vi.fn(), getState, { rejectWithValue: vi.fn() });
};

const countQuotaEvents = (spy: ReturnType<typeof vi.spyOn>): number =>
	spy.mock.calls.filter(([event]: [Event]) => event instanceof QuotaChangedEvent).length;

describe('modifyAppointment quota dispatch', () => {
	describe('ModifyAppointment branch', () => {
		it('dispatches when attachments exceed 1 MB', async () => {
			createSoapAPIInterceptor('ModifyAppointment', { calItemId: '1', echo: [] });
			const spy = vi.spyOn(window, 'dispatchEvent');

			await runThunk(buildEditor({ attachmentFiles: [{ size: ONE_MB + 1 }] as any }));

			expect(countQuotaEvents(spy)).toBe(1);
		});

		it('does not dispatch when attachments are below the threshold', async () => {
			createSoapAPIInterceptor('ModifyAppointment', { calItemId: '1', echo: [] });
			const spy = vi.spyOn(window, 'dispatchEvent');

			await runThunk(buildEditor({ attachmentFiles: [{ size: 512 * 1024 }] as any }));

			expect(countQuotaEvents(spy)).toBe(0);
		});
	});

	describe('CreateAppointmentException branch', () => {
		it('dispatches when attachments exceed 1 MB', async () => {
			createSoapAPIInterceptor('CreateAppointmentException', {
				calItemId: '1',
				invId: '1-inv'
			});
			const spy = vi.spyOn(window, 'dispatchEvent');

			await runThunk(
				buildEditor({
					isSeries: true,
					isInstance: true,
					isException: false,
					attachmentFiles: [{ size: 10 * ONE_MB }] as any
				})
			);

			expect(countQuotaEvents(spy)).toBe(1);
		});

		it('does not dispatch when attachments are below the threshold', async () => {
			createSoapAPIInterceptor('CreateAppointmentException', {
				calItemId: '1',
				invId: '1-inv'
			});
			const spy = vi.spyOn(window, 'dispatchEvent');

			await runThunk(
				buildEditor({
					isSeries: true,
					isInstance: true,
					isException: false,
					attachmentFiles: [] as any
				})
			);

			expect(countQuotaEvents(spy)).toBe(0);
		});
	});
});

describe('modifyAppointment invite changes', () => {
	beforeEach(() => {
		vi.mocked(normalizeSoapMessageFromEditor).mockClear();
	});

	it('passes undefined changes when there is no original editor in state', async () => {
		createSoapAPIInterceptor('ModifyAppointment', { calItemId: '1', echo: [] });

		await runThunk(buildEditor({ plainText: 'after' }));

		expect(normalizeSoapMessageFromEditor).toHaveBeenCalledWith(
			expect.objectContaining({ draft: true }),
			undefined
		);
	});

	it('computes and forwards the diff against originalEditors from state (ModifyAppointment branch)', async () => {
		createSoapAPIInterceptor('ModifyAppointment', { calItemId: '1', echo: [] });
		const original = buildEditor({ plainText: 'before' });
		const current = buildEditor({ plainText: 'after' });
		const getState = vi.fn(() => ({ editor: { originalEditors: { 'editor-id': original } } }));

		await runThunk(current, getState);

		expect(normalizeSoapMessageFromEditor).toHaveBeenCalledWith(
			expect.objectContaining({ draft: true }),
			{ message: { before: 'before', after: 'after' } }
		);
	});

	it('computes and forwards the diff against originalEditors from state (CreateAppointmentException branch)', async () => {
		createSoapAPIInterceptor('CreateAppointmentException', { calItemId: '1', invId: '1-inv' });
		const original = buildEditor({
			isSeries: true,
			isInstance: true,
			isException: false,
			plainText: 'before'
		});
		const current = buildEditor({
			isSeries: true,
			isInstance: true,
			isException: false,
			plainText: 'after'
		});
		const getState = vi.fn(() => ({ editor: { originalEditors: { 'editor-id': original } } }));

		await runThunk(current, getState);

		expect(normalizeSoapMessageFromEditor).toHaveBeenCalledWith(
			expect.objectContaining({ draft: true }),
			{ message: { before: 'before', after: 'after' } }
		);
	});
});
