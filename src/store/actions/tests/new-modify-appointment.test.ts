/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ONE_MB, QuotaChangedEvent } from '../../../event-bus/quota-changed';
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
		...overrides
	}) as unknown as Editor;

const runThunk = async (editor: Editor): Promise<void> => {
	const thunk = modifyAppointment({ draft: true, editor });
	await thunk(vi.fn(), vi.fn(), { rejectWithValue: vi.fn() });
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
