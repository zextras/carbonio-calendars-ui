/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, it, expect, vi } from 'vitest';

import { sendResponse } from './invite-reply-actions';
import { moveAppointmentRequest } from '../../store/actions/move-appointment';
import { sendInviteResponse } from '../../store/actions/send-invite-response';
import { InviteReplyVerb } from 'soap/send-invite-reply-request';

vi.mock('../../store/actions/move-appointment');
vi.mock('../../store/actions/send-invite-response');

describe('invite-reply-actions', () => {
	const mockDispatch = vi.fn();
	const mockReplaceHistory = vi.fn();
	const mockCreateSnackbar = vi.fn();
	const mockT = ((key: string, defaultValue: string) => defaultValue) as any;

	const baseArgs = {
		inviteId: 'invite-123',
		notifyOrganizer: true,
		dispatch: mockDispatch,
		replaceHistory: mockReplaceHistory,
		t: mockT,
		createSnackbar: mockCreateSnackbar,
		parent: 'folder-1'
	};

	describe('sendResponse - ACCEPT action', () => {
		it('should dispatch sendInviteResponse with correct parameters for ACCEPT', () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			vi.mocked(sendInviteResponse).mockReturnValue({ type: 'sendInviteResponse' } as any);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			expect(vi.mocked(sendInviteResponse)).toHaveBeenCalledWith({
				inviteId: 'invite-123',
				updateOrganizer: true,
				action: InviteReplyVerb.ACCEPT
			});
		});

		it('should show ACCEPT snackbar message on successful response', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					key: 'invite_ACCEPT',
					severity: 'info',
					label: expect.stringContaining('Accepted')
				})
			);
		});

		it('should replace history to parent folder on successful ACCEPT response', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			expect(mockReplaceHistory).toHaveBeenCalledWith('/mails/folder/folder-1');
		});

		it('should move appointment to active calendar on ACCEPT response', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			vi.mocked(moveAppointmentRequest).mockReturnValue({ type: 'moveAppointment' } as any);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			expect(mockDispatch).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'moveAppointment'
				})
			);
		});
	});

	describe('sendResponse - TENTATIVE action', () => {
		it('should show TENTATIVE snackbar message on successful response', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.TENTATIVE,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					key: 'invite_TENTATIVE',
					severity: 'info',
					label: expect.stringContaining('Tentative')
				})
			);
		});

		it('should move appointment to active calendar on TENTATIVE response', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			vi.mocked(moveAppointmentRequest).mockReturnValue({ type: 'moveAppointment' } as any);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.TENTATIVE,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			expect(mockDispatch).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'moveAppointment'
				})
			);
		});
	});

	describe('sendResponse - DECLINE action', () => {
		it('should show DECLINE snackbar message on successful response', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.DECLINE,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					key: 'invite_DECLINE',
					severity: 'info',
					label: expect.stringContaining('Declined')
				})
			);
		});

		it('should not move appointment on DECLINE response', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			vi.mocked(moveAppointmentRequest).mockReturnValue({ type: 'moveAppointment' } as any);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.DECLINE,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			// moveAppointmentRequest should not be called for DECLINE
			expect(vi.mocked(moveAppointmentRequest)).not.toHaveBeenCalled();
		});
	});

	describe('sendResponse - error handling', () => {
		it('should show error snackbar on rejected response', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/rejected' });
			mockDispatch.mockReturnValue(dispatchResult);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					key: 'invite_ACCEPT_error',
					severity: 'error',
					label: expect.stringContaining('Something went wrong')
				})
			);
		});

		it('should not replace history on rejected response', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/rejected' });
			mockDispatch.mockReturnValue(dispatchResult);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			expect(mockReplaceHistory).not.toHaveBeenCalled();
		});

		it('should not move appointment on rejected response', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/rejected' });
			mockDispatch.mockReturnValue(dispatchResult);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			expect(vi.mocked(moveAppointmentRequest)).not.toHaveBeenCalled();
		});
	});

	describe('sendResponse - parent folder handling', () => {
		it('should not replace history when parent is empty', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			sendResponse({
				...baseArgs,
				parent: '',
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			expect(mockReplaceHistory).not.toHaveBeenCalled();
		});

		it('should replace history when parent is provided', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			sendResponse({
				...baseArgs,
				parent: 'folder-456',
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			expect(mockReplaceHistory).toHaveBeenCalledWith('/mails/folder/folder-456');
		});
	});

	describe('sendResponse - calendar move handling', () => {
		it('should move appointment with LinkFolder zid when activeCalendar is a LinkFolder', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			vi.mocked(moveAppointmentRequest).mockReturnValue({ type: 'moveAppointment' } as any);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { zid: 'link-cal-123' } as any
			});

			await dispatchResult;

			expect(mockDispatch).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'moveAppointment'
				})
			);
		});

		it('should not move appointment when activeCalendar is null', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: null
			});

			await dispatchResult;

			expect(vi.mocked(moveAppointmentRequest)).not.toHaveBeenCalled();
		});

		it('should move appointment when calendar id is not CALENDAR constant', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			vi.mocked(moveAppointmentRequest).mockReturnValue({ type: 'moveAppointment' } as any);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			// When id is not '1', moveAppointmentRequest should be called
			expect(vi.mocked(moveAppointmentRequest)).toHaveBeenCalled();
		});
	});

	describe('sendResponse - notifyOrganizer parameter', () => {
		it('should pass notifyOrganizer as true', () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			vi.mocked(sendInviteResponse).mockReturnValue({ type: 'sendInviteResponse' } as any);

			sendResponse({
				...baseArgs,
				notifyOrganizer: true,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			expect(vi.mocked(sendInviteResponse)).toHaveBeenCalledWith(
				expect.objectContaining({
					updateOrganizer: true
				})
			);
		});

		it('should pass notifyOrganizer as false', () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			vi.mocked(sendInviteResponse).mockReturnValue({ type: 'sendInviteResponse' } as any);

			sendResponse({
				...baseArgs,
				notifyOrganizer: false,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			expect(vi.mocked(sendInviteResponse)).toHaveBeenCalledWith(
				expect.objectContaining({
					updateOrganizer: false
				})
			);
		});
	});

	describe('sendResponse - snackbar configuration', () => {
		it('should set replace flag to true for snackbar', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					replace: true
				})
			);
		});

		it('should set autoHideTimeout to 3000ms for snackbar', async () => {
			const dispatchResult = Promise.resolve({ type: 'sendInviteResponse/fulfilled' });
			mockDispatch.mockReturnValue(dispatchResult);

			sendResponse({
				...baseArgs,
				action: InviteReplyVerb.ACCEPT,
				activeCalendar: { id: 'cal-123', name: 'Calendar' } as any
			});

			await dispatchResult;

			expect(mockCreateSnackbar).toHaveBeenCalledWith(
				expect.objectContaining({
					autoHideTimeout: 3000
				})
			);
		});
	});
});
