/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { act } from '@testing-library/react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';

import { useDeleteActions } from './use-delete-actions';
import { reducers } from '../store/redux';
import mockedData from '../test/generators';
import { setupHook } from '@test-setup';
import { getSetupServer } from '@jest-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { mockUseHistoryNavigation } from '@test-utils/routing/use-history-navigation-mock';

const makeStore = (
	event: ReturnType<typeof mockedData.getEvent>,
	invite: ReturnType<typeof mockedData.getInvite>
): ReturnType<typeof configureStore> => {
	const appointment = mockedData.getAppointment({ event });
	return configureStore({
		reducer: combineReducers(reducers),
		preloadedState: {
			appointments: {
				status: 'init',
				appointments: { [event.resource.id]: appointment }
			},
			invites: {
				status: '',
				invites: { [event.resource.inviteId]: invite }
			}
		}
	});
};

describe('useDeleteActions', () => {
	beforeEach(() => {
		mockUseHistoryNavigation();
	});

	describe('deleteRecurrentInstance', () => {
		it('sends invite reply then cancels the instance when notifyOrganizer is true', async () => {
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const store = makeStore(event, invite);

			const sendReplyInterceptor = createSoapAPIInterceptor('SendInviteReply', {
				apptId: 'appt-1',
				calItemId: 'cal-1',
				invId: 'inv-1'
			});
			const cancelInterceptor = createSoapAPIInterceptor('CancelAppointment', {});

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
				await sendReplyInterceptor;
				await cancelInterceptor;
			});

			await expect(sendReplyInterceptor).resolves.toBeDefined();
			await expect(cancelInterceptor).resolves.toBeDefined();
		});

		it('sends invite reply but skips cancel when the reply fails', async () => {
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const store = makeStore(event, invite);

			const sendReplyInterceptor = createSoapAPIInterceptor('SendInviteReply', {
				Fault: {
					Code: { Value: 'SOAP-ENV:Receiver' },
					Reason: { Text: 'Service failure' },
					Detail: { Error: { Code: 'SERVICE.FAILURE', Trace: '', _jsns: 'urn:zimbra' } }
				}
			});

			let cancelCalled = false;
			getSetupServer().use(
				http.post('/service/soap/CancelAppointmentRequest', () => {
					cancelCalled = true;
					return HttpResponse.json({ Body: { CancelAppointmentResponse: {} } });
				})
			);

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
				await sendReplyInterceptor;
				await Promise.resolve();
				await Promise.resolve();
			});

			await expect(sendReplyInterceptor).resolves.toBeDefined();
			expect(cancelCalled).toBe(false);
		});

		it('cancels the instance directly without sending a reply when notifyOrganizer is false', async () => {
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const store = makeStore(event, invite);

			let sendReplyCalled = false;
			getSetupServer().use(
				http.post('/service/soap/SendInviteReplyRequest', () => {
					sendReplyCalled = true;
					return HttpResponse.json({
						Body: { SendInviteReplyResponse: { apptId: 'a', calItemId: 'c', invId: 'i' } }
					});
				})
			);

			const cancelInterceptor = createSoapAPIInterceptor('CancelAppointment', {});

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
				await cancelInterceptor;
			});

			await expect(cancelInterceptor).resolves.toBeDefined();
			expect(sendReplyCalled).toBe(false);
		});
	});

	describe('toggleNotifyOrganizer', () => {
		it('toggles notifyOrganizer from false to true', () => {
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const store = makeStore(event, invite);

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
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const store = makeStore(event, invite);

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
