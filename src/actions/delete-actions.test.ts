/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, it, expect, vi } from 'vitest';

import { generateSnackbar, sendResponse } from './delete-actions';
import { sendInviteResponse } from '../store/actions/send-invite-response';

vi.mock('../store/actions/send-invite-response');
vi.mock('../store/actions/move-appointment-to-trash');

describe('delete-actions', () => {
	const mockDispatch = vi.fn();
	const mockEvent = {
		resource: { inviteId: 'invite-123' }
	} as any;
	const mockContext = { dispatch: mockDispatch };

	beforeEach(() => {
		vi.mocked(sendInviteResponse).mockReturnValue({ type: 'sendInviteResponse' } as any);
		mockDispatch.mockReturnValue(Promise.resolve({ type: 'sendInviteResponse/fulfilled' }));
	});

	describe('sendResponse - m (custom message) parameter', () => {
		it('should forward m to sendInviteResponse when provided', () => {
			const m = {
				su: 'Cancelled: Meeting',
				mp: { ct: 'multipart/alternative', mp: [{ ct: 'text/plain', content: 'body' }] }
			};

			sendResponse(mockEvent, mockContext, undefined, m);

			expect(vi.mocked(sendInviteResponse)).toHaveBeenCalledWith(expect.objectContaining({ m }));
		});

		it('should not include m in sendInviteResponse when not provided', () => {
			sendResponse(mockEvent, mockContext);

			const call = vi.mocked(sendInviteResponse).mock.calls[0][0];
			expect(call).not.toHaveProperty('m');
		});

		it('should not include m when explicitly undefined', () => {
			sendResponse(mockEvent, mockContext, undefined, undefined);

			const call = vi.mocked(sendInviteResponse).mock.calls[0][0];
			expect(call).not.toHaveProperty('m');
		});

		it('should forward both exceptId and m when both are provided', () => {
			const exceptId = { d: '20240207T090000', tz: 'Europe/Berlin' };
			const m = { su: 'Cancelled: Meeting', mp: { ct: 'text/plain', content: 'body' } };

			sendResponse(mockEvent, mockContext, exceptId, m);

			expect(vi.mocked(sendInviteResponse)).toHaveBeenCalledWith(
				expect.objectContaining({ exceptId, m })
			);
		});
	});

	describe('generateSnackbar', () => {
		const mockT = vi.fn((_key: string, fallback: string) => fallback);
		const mockCreateSnackbar = vi.fn();

		it('calls createSnackbar with error severity when result type does not include fulfilled', () => {
			generateSnackbar({
				res: { type: 'some/rejected' },
				t: mockT,
				createSnackbar: mockCreateSnackbar
			});

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({ severity: 'error' })
			);
		});

		it('does not call createSnackbar when result type includes fulfilled', () => {
			generateSnackbar({
				res: { type: 'some/fulfilled' },
				t: mockT,
				createSnackbar: mockCreateSnackbar
			});

			expect(mockCreateSnackbar).not.toHaveBeenCalled();
		});
	});
});
