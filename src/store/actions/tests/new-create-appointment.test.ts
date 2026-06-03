/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QuotaChangedEvent, ONE_MB } from '../../../event-bus/quota-changed';
import { Editor } from '../../../types/editor';
import { createAppointment } from '../new-create-appointment';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

vi.mock('../../../normalizations/normalize-soap-message-from-editor', () => ({
	normalizeSoapMessageFromEditor: vi.fn(() => ({}))
}));

const buildEditor = (attachmentFiles: Array<{ size: number }>): Editor =>
	({
		id: 'editor-id',
		attachmentFiles,
		recur: undefined
	}) as unknown as Editor;

const runThunk = async (editor: Editor): Promise<void> => {
	const thunk = createAppointment({ draft: true, editor });
	await thunk(vi.fn(), vi.fn(), { rejectWithValue: vi.fn() });
};

describe('createAppointment quota dispatch', () => {
	it('dispatches QuotaChangedEvent when attachments exceed 1 MB', async () => {
		createSoapAPIInterceptor('CreateAppointment', { calItemId: '1', invId: '1-inv' });
		const spy = vi.spyOn(window, 'dispatchEvent');

		await runThunk(buildEditor([{ size: ONE_MB + 1 }]));

		const quotaDispatches = spy.mock.calls.filter(
			([event]: [Event]) => event instanceof QuotaChangedEvent
		);
		expect(quotaDispatches).toHaveLength(1);
	});

	it('does not dispatch when attachments are below the threshold', async () => {
		createSoapAPIInterceptor('CreateAppointment', { calItemId: '1', invId: '1-inv' });
		const spy = vi.spyOn(window, 'dispatchEvent');

		await runThunk(buildEditor([{ size: ONE_MB }]));

		const quotaDispatches = spy.mock.calls.filter(
			([event]: [Event]) => event instanceof QuotaChangedEvent
		);
		expect(quotaDispatches).toHaveLength(0);
	});

	it('does not dispatch when the SOAP call fails', async () => {
		createSoapAPIInterceptor('CreateAppointment', {
			Fault: { Reason: { Text: 'boom' } }
		} as unknown);
		const spy = vi.spyOn(window, 'dispatchEvent');

		await runThunk(buildEditor([{ size: 10 * ONE_MB }]));

		const quotaDispatches = spy.mock.calls.filter(
			([event]: [Event]) => event instanceof QuotaChangedEvent
		);
		expect(quotaDispatches).toHaveLength(0);
	});
});
