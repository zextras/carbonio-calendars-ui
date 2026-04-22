/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen } from '@testing-library/react';
import { useFolderStore } from '@zextras/carbonio-ui-commons';

import { MemoCustomEvent } from '../custom-event';
import { setupTest } from '@test-setup';
import { reducers } from 'store/redux';
import { useAppStatusStore } from 'store/zustand/store';
import mockedData from 'test/generators';

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

	test('does not show attendee reply icon for external calendar events', async () => {
		const event = mockedData.getEvent({
			resource: {
				iAmOrganizer: false,
				calendar: { id: 'external-calendar' },
				participationStatus: 'AC'
			}
		});

		useFolderStore.setState((state) => ({
			...state,
			folders: {
				...state.folders,
				[event.resource.calendar.id]: {
					id: event.resource.calendar.id,
					name: 'External calendar',
					url: 'https://example.com/calendar.ics',
					view: 'appointment' as const,
					uuid: 'external-cal-uuid',
					activesyncdisabled: false,
					recursive: true,
					deletable: true,
					isLink: false,
					depth: 1,
					children: []
				}
			}
		}));

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

		setupTest(<MemoCustomEvent event={event} title={event.title} />, { store });

		expect(screen.queryByTestId('icon: StatusAccept')).not.toBeInTheDocument();
	});

	test('does not show attendee reply icon for CalDAV child calendar events', async () => {
		const caldavRootId = 'caldav-root-for-status';
		const caldavChildId = 'caldav-child-for-status';
		const event = mockedData.getEvent({
			resource: {
				iAmOrganizer: false,
				iAmAttendee: true,
				calendar: { id: caldavChildId },
				participationStatus: 'AC'
			}
		});

		useFolderStore.setState((state) => ({
			...state,
			folders: {
				...state.folders,
				[caldavRootId]: {
					id: caldavRootId,
					name: 'CalDAV Root',
					dsId: 'ds-99',
					dsType: 'caldav',
					view: 'appointment' as const,
					uuid: 'caldav-root-uuid',
					activesyncdisabled: false,
					recursive: false,
					deletable: true,
					isLink: false,
					depth: 1,
					children: []
				},
				[caldavChildId]: {
					id: caldavChildId,
					name: 'CalDAV Calendar',
					parent: caldavRootId,
					l: caldavRootId,
					view: 'appointment' as const,
					uuid: 'caldav-child-uuid',
					activesyncdisabled: false,
					recursive: false,
					deletable: true,
					isLink: false,
					depth: 2,
					children: []
				}
			}
		}));

		const invite = mockedData.getInvite({ event });
		const mockedInviteSlice = { invites: { [invite.id]: invite } };
		const emptyStore = mockedData.store.mockReduxStore({ invites: mockedInviteSlice });
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});

		setupTest(<MemoCustomEvent event={event} title={event.title} />, { store });

		expect(screen.queryByTestId('icon: StatusAccept')).not.toBeInTheDocument();
	});

	test('does not show attendee reply icon for readonly events when external flags are unavailable', async () => {
		const event = mockedData.getEvent({
			haveWriteAccess: false,
			resource: {
				iAmOrganizer: false,
				iAmAttendee: true,
				calendar: { id: 'readonly-calendar', perm: 'r' },
				participationStatus: 'TE'
			}
		});

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

		setupTest(<MemoCustomEvent event={event} title={event.title} />, { store });

		expect(screen.queryByTestId('icon: StatusMaybe')).not.toBeInTheDocument();
	});

	test('does not show link icon for CalDAV child calendar events', () => {
		const caldavRootId = 'caldav-root-for-link';
		const caldavChildId = 'caldav-child-for-link';
		const event = mockedData.getEvent({
			resource: { calendar: { id: caldavChildId } }
		});

		useFolderStore.setState((state) => ({
			...state,
			folders: {
				...state.folders,
				[caldavRootId]: {
					id: caldavRootId,
					name: 'CalDAV Root',
					dsId: 'ds-link-99',
					dsType: 'caldav',
					view: 'appointment' as const,
					uuid: 'caldav-root-link-uuid',
					activesyncdisabled: false,
					recursive: false,
					deletable: true,
					isLink: false,
					depth: 1,
					children: []
				},
				[caldavChildId]: {
					id: caldavChildId,
					name: 'CalDAV Calendar',
					parent: caldavRootId,
					l: caldavRootId,
					view: 'appointment' as const,
					uuid: 'caldav-child-link-uuid',
					activesyncdisabled: false,
					recursive: false,
					deletable: true,
					isLink: false,
					depth: 2,
					children: []
				}
			}
		}));

		const invite = mockedData.getInvite({ event });
		const emptyStore = mockedData.store.mockReduxStore({ invites: { [invite.id]: invite } });
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});

		setupTest(<MemoCustomEvent event={event} title={event.title} />, { store });

		expect(screen.queryByTestId('icon: Link2')).not.toBeInTheDocument();
	});

	test('uses owner free-busy perspective for external calendars in tooltip', async () => {
		const event = mockedData.getEvent({
			resource: {
				iAmOrganizer: false,
				calendar: { id: 'external-calendar-tooltip' },
				freeBusy: 'O',
				freeBusyActual: 'T'
			}
		});

		useFolderStore.setState((state) => ({
			...state,
			folders: {
				...state.folders,
				[event.resource.calendar.id]: {
					id: event.resource.calendar.id,
					name: 'External calendar',
					url: 'https://example.com/calendar.ics',
					view: 'appointment' as const,
					uuid: 'external-tooltip-cal-uuid',
					activesyncdisabled: false,
					recursive: true,
					deletable: true,
					isLink: false,
					depth: 1,
					children: []
				}
			}
		}));

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

		const { user } = setupTest(<MemoCustomEvent event={event} title={event.title} />, { store });

		await user.hover(screen.getByTestId('calendar-event'));
		expect(
			await screen.findByText(/out of office appointment|tooltip\.out_of_office_appointment/i)
		).toBeVisible();
		expect(
			screen.queryByText(/tentative appointment|tooltip\.tentative_appointment/i)
		).not.toBeInTheDocument();
	});
});
