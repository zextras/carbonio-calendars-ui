/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen } from '@testing-library/react';

import { reducers } from '../../../store/redux';
import { useAppStatusStore } from '../../../store/zustand/store';
import mockedData from '../../../test/generators';
import { MemoCustomEvent } from '../custom-event';
import { setupTest } from '@test-setup';

describe('custom-event', () => {
	test('if the event is not part of a recurrence it wont have a recurrent icon', async () => {
		const event = mockedData.getEvent();
		const invite = mockedData.getInvite({ event });
		const mockedInviteSlice = {
			invites: {
				[invite.id]: invite
			}
		};
		const emptyStore = mockedData.store.mockReduxStore({ invites: mockedInviteSlice });
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		setupTest(<MemoCustomEvent event={event} title={event.title} />, {
			store
		});
		expect(screen.queryByTestId('icon: Repeat')).not.toBeInTheDocument();
	});
	test('if the event is part of a recurrence it will have a recurrent icon', async () => {
		const event = mockedData.getEvent({ resource: { isRecurrent: true } });
		const invite = mockedData.getInvite({ event });
		const mockedInviteSlice = {
			invites: {
				[invite.id]: invite
			}
		};
		const emptyStore = mockedData.store.mockReduxStore({ invites: mockedInviteSlice });
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		setupTest(<MemoCustomEvent event={event} title={event.title} />, {
			store
		});
		expect(screen.getByTestId('icon: Repeat')).toBeVisible();
	});
	test('if the event is private it will have a private icon', async () => {
		const event = mockedData.getEvent({ resource: { class: 'PRI', name: '' }, title: '' });
		const invite = mockedData.getInvite({ event });
		const mockedInviteSlice = {
			invites: {
				[invite.id]: invite
			}
		};
		const emptyStore = mockedData.store.mockReduxStore({ invites: mockedInviteSlice });
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		setupTest(<MemoCustomEvent event={event} title={''} />, {
			store
		});
		expect(screen.getByTestId('icon: Lock')).toBeVisible();
	});
	test('if the event is not private it will not have a private icon', async () => {
		const event = mockedData.getEvent({ resource: { class: 'PUB', name: '' }, title: '' });
		const invite = mockedData.getInvite({ event });
		const mockedInviteSlice = {
			invites: {
				[invite.id]: invite
			}
		};
		const emptyStore = mockedData.store.mockReduxStore({ invites: mockedInviteSlice });
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		setupTest(<MemoCustomEvent event={event} title={''} />, {
			store
		});
		expect(screen.queryByTestId('icon: Lock')).not.toBeInTheDocument();
	});
	test('if the event has a title it will be shown', async () => {
		const event = mockedData.getEvent({ resource: { name: 'test' }, title: 'test' });
		const invite = mockedData.getInvite({ event });
		const mockedInviteSlice = {
			invites: {
				[invite.id]: invite
			}
		};
		const emptyStore = mockedData.store.mockReduxStore({ invites: mockedInviteSlice });
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		setupTest(<MemoCustomEvent event={event} title={'test'} />, {
			store
		});
		expect(screen.getByText('test')).toBeVisible();
	});
	test('if the event does not a title it will not be shown', async () => {
		const event = mockedData.getEvent({ resource: { name: '' }, title: '' });
		const invite = mockedData.getInvite({ event });
		const mockedInviteSlice = {
			invites: {
				[invite.id]: invite
			}
		};
		const emptyStore = mockedData.store.mockReduxStore({ invites: mockedInviteSlice });
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		setupTest(<MemoCustomEvent event={event} title={''} />, {
			store
		});
		expect(screen.queryByTestId('event-title')).not.toBeInTheDocument();
	});
	test('single click over the event will save the anchor element to the store', async () => {
		const event = mockedData.getEvent();
		const invite = mockedData.getInvite({ event });
		const mockedInviteSlice = {
			invites: {
				[invite.id]: invite
			}
		};
		const emptyStore = mockedData.store.mockReduxStore({ invites: mockedInviteSlice });
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		const { user } = setupTest(<MemoCustomEvent event={event} title={event.title} />, {
			store
		});

		await user.click(screen.getByTestId('calendar-event-inner-container'));
		act(() => {
			vi.advanceTimersByTime(250);
		});
		expect(useAppStatusStore.getState().summaryViewRef.current).toBeInTheDocument();
	});
});
