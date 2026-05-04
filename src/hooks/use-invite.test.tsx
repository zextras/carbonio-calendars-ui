/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { act, waitFor } from '@testing-library/react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { AppointmentReminderItemDetails } from 'view/reminder/appointment-reminder-item-details';
import { reducers } from 'store/redux';
import mockedData from '../test/generators';
import generateAppointment from '../test/generators/appointment';
import generateInvite from '../test/generators/invite';
import { generateReminderItem } from 'test/generators/reminder';
import * as getMessageRequestModule from '../soap/get-message-request';
import { setupTest, screen } from '@test-setup';

/**
 * High-level component tests that exercise useInvite through
 * AppointmentReminderItemDetails — the most common consumer of the hook.
 *
 * Critical scenarios these cover:
 *  1. When the invite is absent from the store, getInvite is dispatched once.
 *  2. After a successful fetch the invite is rendered (no shimmer visible).
 *  3. When getInvite is rejected (e.g. NO_SUCH_ITEM after folder deletion),
 *     the dispatch is NOT retried — the loop that was causing infinite network
 *     requests is gone.
 *  4. The shimmer remains visible after a failed fetch (graceful degradation).
 */
describe('useInvite — via AppointmentReminderItemDetails', () => {
	const makeStoreWithAppointment = (
		inviteId: string
	): {
		appointment: ReturnType<typeof generateAppointment>;
		store: ReturnType<typeof configureStore>;
	} => {
		const appointment = generateAppointment({ appointment: { inviteId } });
		const mockedStore = mockedData.store.mockReduxStore({
			appointments: { appointments: { [appointment.id]: appointment } },
			invites: { invites: {} }
		});
		return {
			appointment,
			store: configureStore({
				reducer: combineReducers(reducers),
				preloadedState: mockedStore
			})
		};
	};

	describe('when invite is not in the store', () => {
		it('dispatches getInvite exactly once for a given inviteId', async () => {
			const inviteId = faker.string.uuid();
			const { appointment, store } = makeStoreWithAppointment(inviteId);
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const spy = vi
				.spyOn(getMessageRequestModule, 'getMessageRequest')
				.mockResolvedValue({ error: true, Fault: { Code: { Value: 'NO_SUCH_ITEM' } } } as any);

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			// Let the async thunk settle
			await act(async () => {
				await Promise.resolve();
			});

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith(expect.objectContaining({ inviteId }));

			spy.mockRestore();
		});

		it('does NOT retry after the API returns NO_SUCH_ITEM', async () => {
			const inviteId = faker.string.uuid();
			const { appointment, store } = makeStoreWithAppointment(inviteId);
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const spy = vi
				.spyOn(getMessageRequestModule, 'getMessageRequest')
				.mockResolvedValue({ error: true, Fault: { Code: { Value: 'NO_SUCH_ITEM' } } } as any);

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			// Let multiple microtask ticks pass — enough for retry loops to fire
			await act(async () => {
				// Chain 10 microtask ticks without an await-in-loop
				await Array.from({ length: 10 }).reduce<Promise<void>>(
					(promise) => promise.then(() => Promise.resolve()),
					Promise.resolve()
				);
			});

			// Still only one call — no infinite retry
			expect(spy).toHaveBeenCalledTimes(1);

			spy.mockRestore();
		});

		it('keeps showing the shimmer after a failed fetch (graceful degradation)', async () => {
			const inviteId = faker.string.uuid();
			const { appointment, store } = makeStoreWithAppointment(inviteId);
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			vi.spyOn(getMessageRequestModule, 'getMessageRequest').mockResolvedValue({
				error: true,
				Fault: { Code: { Value: 'NO_SUCH_ITEM' } }
			} as any);

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			await act(async () => {
				await Promise.resolve();
			});

			// Shimmer rows are still rendered — invite never populated
			expect(
				screen.getAllByTestId(/appointment-reminder-item-details-shimmer-row-\d+/).length
			).toBeGreaterThan(0);

			vi.restoreAllMocks();
		});

		it('renders detail rows after a successful fetch', async () => {
			const inviteId = faker.string.uuid();
			const { appointment, store } = makeStoreWithAppointment(inviteId);
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });
			const invite = generateInvite({ context: { id: inviteId } });

			// Return a valid message payload that normalizeInvite can parse
			vi.spyOn(getMessageRequestModule, 'getMessageRequest').mockResolvedValue({
				m: [
					{
						id: inviteId,
						inv: [
							{
								type: 'appt',
								comp: [
									{
										name: invite.name,
										method: 'PUBLISH',
										compNum: 0,
										rsvp: false,
										or: {
											a: invite.organizer?.a ?? 'test@example.com',
											d: invite.organizer?.d ?? 'Test'
										},
										s: [{ d: '20260101T090000', tz: 'UTC', u: Date.now() }],
										e: [{ d: '20260101T100000', tz: 'UTC', u: Date.now() }]
									}
								]
							}
						]
					}
				]
			} as any);

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			// Initially shimmer is shown
			expect(
				screen.getAllByTestId(/appointment-reminder-item-details-shimmer-row-\d+/).length
			).toBeGreaterThan(0);

			// After the fetch resolves, shimmer disappears
			await waitFor(() => {
				expect(
					screen.queryAllByTestId(/appointment-reminder-item-details-shimmer-row-\d+/).length
				).toBe(0);
			});

			vi.restoreAllMocks();
		});
	});

	describe('when invite is already in the store', () => {
		it('does not call getInvite at all', async () => {
			const inviteId = faker.string.uuid();
			const invite = generateInvite({ context: { id: inviteId } });
			const appointment = generateAppointment({ appointment: { inviteId } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const preloadedState = mockedData.store.mockReduxStore({
				appointments: { appointments: { [appointment.id]: appointment } },
				invites: { invites: { [inviteId]: invite } }
			});
			const store = configureStore({
				reducer: combineReducers(reducers),
				preloadedState
			});

			const spy = vi.spyOn(getMessageRequestModule, 'getMessageRequest');

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			await act(async () => {
				await Promise.resolve();
			});

			expect(spy).not.toHaveBeenCalled();
			spy.mockRestore();
		});

		it('renders detail rows immediately without a network request', () => {
			const inviteId = faker.string.uuid();
			const invite = generateInvite({ context: { id: inviteId } });
			const appointment = generateAppointment({ appointment: { inviteId } });
			const reminderItem = generateReminderItem({ inviteId, id: appointment.id });

			const preloadedState = mockedData.store.mockReduxStore({
				appointments: { appointments: { [appointment.id]: appointment } },
				invites: { invites: { [inviteId]: invite } }
			});
			const store = configureStore({
				reducer: combineReducers(reducers),
				preloadedState
			});

			setupTest(<AppointmentReminderItemDetails reminderItem={reminderItem} />, { store });

			// No shimmer — invite was pre-loaded
			expect(
				screen.queryAllByTestId(/appointment-reminder-item-details-shimmer-row-\d+/).length
			).toBe(0);
		});
	});

	describe('when inviteId changes', () => {
		it('fetches the new invite after inviteId prop changes', async () => {
			const inviteId1 = faker.string.uuid();
			const inviteId2 = faker.string.uuid();

			const appointment1 = generateAppointment({ appointment: { inviteId: inviteId1 } });
			const appointment2 = generateAppointment({ appointment: { inviteId: inviteId2 } });
			const reminderItem1 = generateReminderItem({ inviteId: inviteId1, id: appointment1.id });
			const reminderItem2 = generateReminderItem({ inviteId: inviteId2, id: appointment2.id });

			const preloadedState = mockedData.store.mockReduxStore({
				appointments: {
					appointments: {
						[appointment1.id]: appointment1,
						[appointment2.id]: appointment2
					}
				},
				invites: { invites: {} }
			});
			const store = configureStore({
				reducer: combineReducers(reducers),
				preloadedState
			});

			const spy = vi
				.spyOn(getMessageRequestModule, 'getMessageRequest')
				.mockResolvedValue({ error: true, Fault: {} } as any);

			const { rerender } = setupTest(
				<AppointmentReminderItemDetails reminderItem={reminderItem1} />,
				{ store }
			);

			await act(async () => {
				await Promise.resolve();
			});

			expect(spy).toHaveBeenCalledTimes(1);
			expect(spy).toHaveBeenCalledWith(expect.objectContaining({ inviteId: inviteId1 }));

			// Switch to a different reminder item → should fetch the new inviteId
			rerender(<AppointmentReminderItemDetails reminderItem={reminderItem2} />);

			await act(async () => {
				await Promise.resolve();
			});

			expect(spy).toHaveBeenCalledTimes(2);
			expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ inviteId: inviteId2 }));

			spy.mockRestore();
		});
	});
});
