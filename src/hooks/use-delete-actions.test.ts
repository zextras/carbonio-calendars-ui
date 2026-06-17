/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act } from '@testing-library/react';
import { useSnackbar } from '@zextras/carbonio-design-system';
import { Mock } from 'vitest';

import * as deleteActionsModule from '../actions/delete-actions';
import { useDeleteActions } from './use-delete-actions';
import mockedData from '../test/generators';
import { setupHook } from '@test-setup';
import { mockUseHistoryNavigation } from '@test-utils/routing/use-history-navigation-mock';

vi.mock('../store/redux/hooks', async () => ({
	...(await vi.importActual('../store/redux/hooks')),
	useAppDispatch: vi.fn()
}));

vi.mock('@zextras/carbonio-design-system', async () => ({
	...(await vi.importActual('@zextras/carbonio-design-system')),
	useSnackbar: vi.fn()
}));

vi.mock('../actions/delete-actions');
vi.mock('../store/actions/move-appointment-to-trash');

describe('useDeleteActions', () => {
	let mockDispatch: Mock;

	beforeEach(async () => {
		mockDispatch = vi.fn();
		const hooks = await import('../store/redux/hooks');
		vi.mocked(hooks.useAppDispatch).mockReturnValue(mockDispatch as any);
		(useSnackbar as Mock).mockReturnValue(vi.fn());
		mockUseHistoryNavigation();
	});

	describe('deleteRecurrentInstance', () => {
		it('calls sendResponse then deleteEvent when notifyOrganizer is true and response is fulfilled', async () => {
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const mockOnClose = vi.fn();

			vi.mocked(deleteActionsModule.sendResponse).mockResolvedValue({
				type: 'invites/sendInviteResponse/fulfilled'
			} as any);
			vi.mocked(deleteActionsModule.deleteEvent).mockResolvedValue({
				type: 'appointments/moveToTrash/fulfilled'
			} as any);

			const { result } = setupHook(() =>
				useDeleteActions(event, invite, {
					dispatch: mockDispatch,
					onClose: mockOnClose,
					folders: {}
				})
			);

			act(() => {
				result.current.toggleNotifyOrganizer();
			});

			await act(async () => {
				result.current.deleteRecurrentInstance();
				await Promise.resolve();
				await Promise.resolve();
			});

			expect(vi.mocked(deleteActionsModule.sendResponse)).toHaveBeenCalled();
			expect(vi.mocked(deleteActionsModule.deleteEvent)).toHaveBeenCalled();
		});

		it('does not call deleteEvent when sendResponse rejects', async () => {
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const mockOnClose = vi.fn();

			vi.mocked(deleteActionsModule.sendResponse).mockResolvedValue({
				type: 'invites/sendInviteResponse/rejected'
			} as any);
			vi.mocked(deleteActionsModule.deleteEvent).mockResolvedValue({
				type: 'appointments/moveToTrash/fulfilled'
			} as any);

			const { result } = setupHook(() =>
				useDeleteActions(event, invite, {
					dispatch: mockDispatch,
					onClose: mockOnClose,
					folders: {}
				})
			);

			act(() => {
				result.current.toggleNotifyOrganizer();
			});

			await act(async () => {
				result.current.deleteRecurrentInstance();
				await Promise.resolve();
				await Promise.resolve();
			});

			expect(vi.mocked(deleteActionsModule.sendResponse)).toHaveBeenCalled();
			expect(vi.mocked(deleteActionsModule.deleteEvent)).not.toHaveBeenCalled();
		});

		it('calls deleteEvent directly without sendResponse when notifyOrganizer is false', async () => {
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const mockOnClose = vi.fn();

			vi.mocked(deleteActionsModule.deleteEvent).mockResolvedValue({
				type: 'appointments/moveToTrash/fulfilled'
			} as any);

			const { result } = setupHook(() =>
				useDeleteActions(event, invite, {
					dispatch: mockDispatch,
					onClose: mockOnClose,
					folders: {}
				})
			);

			await act(async () => {
				result.current.deleteRecurrentInstance();
				await Promise.resolve();
			});

			expect(vi.mocked(deleteActionsModule.sendResponse)).not.toHaveBeenCalled();
			expect(vi.mocked(deleteActionsModule.deleteEvent)).toHaveBeenCalled();
		});
	});

	describe('toggleNotifyOrganizer', () => {
		it('toggles notifyOrganizer from false to true', () => {
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });

			const { result } = setupHook(() =>
				useDeleteActions(event, invite, {
					dispatch: mockDispatch,
					onClose: vi.fn(),
					folders: {}
				})
			);

			expect(result.current.notifyOrganizer).toBe(false);

			act(() => {
				result.current.toggleNotifyOrganizer();
			});

			expect(result.current.notifyOrganizer).toBe(true);
		});
	});

	describe('toggleDeleteAll', () => {
		it('toggles deleteAll from true to false', () => {
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });

			const { result } = setupHook(() =>
				useDeleteActions(event, invite, {
					dispatch: mockDispatch,
					onClose: vi.fn(),
					folders: {}
				})
			);

			expect(result.current.deleteAll).toBe(true);

			act(() => {
				result.current.toggleDeleteAll();
			});

			expect(result.current.deleteAll).toBe(false);
		});
	});
});
