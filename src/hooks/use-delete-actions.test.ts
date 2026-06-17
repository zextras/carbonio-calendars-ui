/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act } from '@testing-library/react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import * as deleteActionsModule from '../actions/delete-actions';
import { useDeleteActions } from './use-delete-actions';
import { reducers } from '../store/redux';
import mockedData from '../test/generators';
import { setupHook } from '@test-setup';
import { mockUseHistoryNavigation } from '@test-utils/routing/use-history-navigation-mock';

vi.mock('../actions/delete-actions');

describe('useDeleteActions', () => {
	beforeEach(() => {
		mockUseHistoryNavigation();
	});

	describe('deleteRecurrentInstance', () => {
		it('calls sendResponse then deleteEvent when notifyOrganizer is true and response is fulfilled', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });

			vi.mocked(deleteActionsModule.sendResponse).mockResolvedValue({
				type: 'invites/sendInviteResponse/fulfilled'
			} as any);
			vi.mocked(deleteActionsModule.deleteEvent).mockResolvedValue({
				type: 'appointments/moveToTrash/fulfilled'
			} as any);

			const { result } = setupHook(
				() =>
					useDeleteActions(event, invite, {
						dispatch: store.dispatch,
						onClose: vi.fn(),
						folders: {}
					}),
				{ store }
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
			const store = configureStore({ reducer: combineReducers(reducers) });
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });

			vi.mocked(deleteActionsModule.sendResponse).mockResolvedValue({
				type: 'invites/sendInviteResponse/rejected'
			} as any);
			vi.mocked(deleteActionsModule.deleteEvent).mockResolvedValue({
				type: 'appointments/moveToTrash/fulfilled'
			} as any);

			const { result } = setupHook(
				() =>
					useDeleteActions(event, invite, {
						dispatch: store.dispatch,
						onClose: vi.fn(),
						folders: {}
					}),
				{ store }
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
			const store = configureStore({ reducer: combineReducers(reducers) });
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });

			vi.mocked(deleteActionsModule.deleteEvent).mockResolvedValue({
				type: 'appointments/moveToTrash/fulfilled'
			} as any);

			const { result } = setupHook(
				() =>
					useDeleteActions(event, invite, {
						dispatch: store.dispatch,
						onClose: vi.fn(),
						folders: {}
					}),
				{ store }
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
			const store = configureStore({ reducer: combineReducers(reducers) });
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });

			const { result } = setupHook(
				() =>
					useDeleteActions(event, invite, {
						dispatch: store.dispatch,
						onClose: vi.fn(),
						folders: {}
					}),
				{ store }
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
			const store = configureStore({ reducer: combineReducers(reducers) });
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });

			const { result } = setupHook(
				() =>
					useDeleteActions(event, invite, {
						dispatch: store.dispatch,
						onClose: vi.fn(),
						folders: {}
					}),
				{ store }
			);

			expect(result.current.deleteAll).toBe(true);

			act(() => {
				result.current.toggleDeleteAll();
			});

			expect(result.current.deleteAll).toBe(false);
		});
	});
});
