/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen } from '@testing-library/react';
import { useFolderStore } from '@zextras/carbonio-ui-commons';

import { AppointmentReminder } from './appointment-reminder';
import { EVENT_DISPLAY_STATUS, PARTICIPATION_STATUS } from 'constants/api';
import { deleteAppointmentPermanent } from 'store/actions/delete-appointment-permanent';
import { reducers } from 'store/redux';
import mockedData from '../../test/generators';
import { Appointment } from 'types/store/appointments';
import * as notifications from '../notifications';
import { setupTest } from '@test-setup';

describe('appointment reminders', () => {
	test("'when the appointment is deleted also the relative reminder is deleted", async () => {
		const event = mockedData.getEvent();
		const event2 = mockedData.getEvent();

		// Populate the folder store with the two event calendars so that
		// isEmpty(calendars) is false and the alarm guard lets them through.
		useFolderStore.setState((state) => ({
			...state,
			folders: {
				...state.folders,
				[event.resource.calendar.id]: {
					id: event.resource.calendar.id,
					name: event.resource.calendar.name,
					view: 'appointment',
					uuid: '',
					activesyncdisabled: false,
					recursive: false,
					deletable: true,
					isLink: false,
					depth: 1,
					children: []
				},
				[event2.resource.calendar.id]: {
					id: event2.resource.calendar.id,
					name: event2.resource.calendar.name,
					view: 'appointment',
					uuid: '',
					activesyncdisabled: false,
					recursive: false,
					deletable: true,
					isLink: false,
					depth: 1,
					children: []
				}
			}
		}));

		const fakeReducers = {
			appointments: {
				appointments: {
					[event.resource.id]: {
						id: event.resource.id,
						class: 'PUB',
						flags: '',
						alarm: true,
						alarmData: [
							{
								nextAlarm: event.resource.alarmData?.[0]?.alarmInstStart,
								alarmInstStart: event.resource.alarmData?.[0]?.alarmInstStart,
								invId: 1322,
								compNum: 0,
								name: '',
								loc: '',
								alarm: [
									{
										action: 'DISPLAY',
										trigger: [
											{
												rel: [
													{
														neg: 'true',
														m: 10,
														related: 'START'
													}
												]
											}
										],
										desc: {
											description: ''
										}
									}
								]
							}
						],
						hasEx: false,
						fb: EVENT_DISPLAY_STATUS.FREE,
						fr: '',
						d: 1234,
						fba: EVENT_DISPLAY_STATUS.FREE,
						md: 0,
						ms: 0,
						ptst: PARTICIPATION_STATUS.ACCEPTED,
						rev: 0,
						status: 'CONF',
						transp: '',
						uid: '',
						compNum: 0,
						dur: 1800000,
						allDay: false,
						inst: [
							{
								recur: false,
								ridZ: '',
								s: 0
							}
						],
						draft: false,
						inviteId: event.resource.inviteId,
						isOrg: event.resource.iAmOrganizer,
						loc: event.resource.location,
						otherAtt: false,
						recur: false,
						l: event.resource.calendar.id,
						name: event.title,
						neverSent: false,
						or: {},
						s: 0,
						tags: []
					} as Appointment,
					[event2.resource.id]: {
						id: event2.resource.id,
						class: 'PUB',
						flags: '',
						alarm: true,
						alarmData: [
							{
								nextAlarm: event2.resource.alarmData?.[0]?.alarmInstStart,
								alarmInstStart: event2.resource.alarmData?.[0]?.alarmInstStart,
								invId: 1322,
								compNum: 0,
								name: '[CRAB ONIONS] Review',
								loc: '',
								alarm: [
									{
										action: 'DISPLAY',
										trigger: [
											{
												rel: [
													{
														neg: 'true',
														m: 5,
														related: 'START'
													}
												]
											}
										],
										desc: {
											description: ''
										}
									}
								]
							}
						],
						hasEx: false,
						fb: EVENT_DISPLAY_STATUS.FREE,
						fba: EVENT_DISPLAY_STATUS.FREE,
						fr: '',
						d: 1234,
						md: 0,
						ms: 0,
						ptst: PARTICIPATION_STATUS.ACCEPTED,
						rev: 0,
						status: 'CONF',
						transp: '',
						uid: '',
						compNum: 0,
						dur: 1234,
						allDay: false,
						inst: [
							{
								recur: false,
								ridZ: '',
								s: 0
							}
						],
						draft: false,
						inviteId: event2.resource.inviteId,
						isOrg: event2.resource.iAmOrganizer,
						loc: event2.resource.location,
						otherAtt: false,
						recur: false,
						l: event2.resource.calendar.id,
						name: event2.title,
						neverSent: false,
						or: {},
						s: 0,
						tags: []
					} as Appointment
				}
			}
		};

		const emptyStore = mockedData.store.mockReduxStore(fakeReducers);

		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		setupTest(<AppointmentReminder />, { store });

		const today = new Date().valueOf();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const diff = event2.resource.alarmData[0].alarmInstStart - today;

		act(() => {
			vi.advanceTimersByTime(diff + 12345);
		});

		expect(screen.getByTestId('reminder-modal')).toBeInTheDocument();

		await act(async () => {
			await store.dispatch(
				deleteAppointmentPermanent({
					id: event2.resource.id
				})
			);
		});

		await act(async () => {
			await store.dispatch(
				deleteAppointmentPermanent({
					id: event.resource.id
				})
			);
		});

		act(() => {
			vi.advanceTimersByTime(1000);
		});

		expect(screen.queryByTestId('reminder-modal')).not.toBeInTheDocument();
	});

	test('does not notify for appointments from external calendars', async () => {
		const externalCalendarId = 'external-cal-for-reminder';
		const notificationSpy = vi.spyOn(notifications, 'showNotification').mockImplementation(vi.fn());
		const playSpy = vi
			.spyOn(HTMLMediaElement.prototype, 'play')
			.mockImplementation(() => Promise.resolve());

		useFolderStore.setState((state) => ({
			...state,
			folders: {
				...state.folders,
				[externalCalendarId]: {
					id: externalCalendarId,
					name: 'External Calendar',
					url: 'https://example.com/calendar.ics',
					f: '#y',
					view: 'appointment',
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

		const now = Date.now();
		const fakeReducers = {
			appointments: {
				appointments: {
					externalAppt: {
						id: 'externalAppt',
						class: 'PUB',
						flags: '',
						alarm: true,
						alarmData: [
							{
								nextAlarm: now - 1000,
								alarmInstStart: now - 1000,
								invId: 1,
								compNum: 0,
								name: 'External event',
								loc: '',
								alarm: [
									{
										action: 'DISPLAY',
										trigger: [{ rel: [{ neg: 'true', m: 5, related: 'START' }] }],
										desc: { description: '' }
									}
								]
							}
						],
						hasEx: false,
						fb: EVENT_DISPLAY_STATUS.FREE,
						fba: EVENT_DISPLAY_STATUS.FREE,
						fr: '',
						d: 1234,
						md: 0,
						ms: 0,
						ptst: PARTICIPATION_STATUS.ACCEPTED,
						rev: 0,
						status: 'CONF',
						transp: '',
						uid: '',
						compNum: 0,
						dur: 1800000,
						allDay: false,
						inst: [{ recur: false, ridZ: '', s: 0 }],
						draft: false,
						inviteId: 'external-invite-id',
						isOrg: false,
						loc: '',
						otherAtt: false,
						recur: false,
						l: externalCalendarId,
						name: 'External event',
						neverSent: false,
						or: {},
						s: 0,
						tags: []
					} as Appointment
				}
			}
		};

		const emptyStore = mockedData.store.mockReduxStore(fakeReducers);
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});

		setupTest(<AppointmentReminder />, { store });

		act(() => {
			vi.advanceTimersByTime(2000);
		});

		expect(notificationSpy).not.toHaveBeenCalled();
		expect(playSpy).not.toHaveBeenCalled();
		expect(screen.queryByTestId('reminder-modal')).not.toBeInTheDocument();
	});

	test('does not notify for any appointment when the folder store is not yet populated (race condition guard)', async () => {
		/**
		 * Regression guard: a CalDAV sync push notification can arrive and add
		 * appointments to the Redux store BEFORE the folder worker has finished
		 * populating useFolderStore. When calendars === {} the old code would
		 * resolve `cal` as undefined → isIcsOrCaldavExternalFolder({}) = false →
		 * the appointment slipped through and fired audio + desktop notification.
		 */
		const notificationSpy = vi.spyOn(notifications, 'showNotification').mockImplementation(vi.fn());
		const playSpy = vi
			.spyOn(HTMLMediaElement.prototype, 'play')
			.mockImplementation(() => Promise.resolve());

		// Leave the folder store completely empty (simulate app start before folders load)
		useFolderStore.setState((state) => ({ ...state, folders: {} }));

		const now = Date.now();
		const fakeReducers = {
			appointments: {
				appointments: {
					earlyAppt: {
						id: 'earlyAppt',
						class: 'PUB',
						flags: '',
						alarm: true,
						alarmData: [
							{
								nextAlarm: now - 1000,
								alarmInstStart: now - 1000,
								invId: 1,
								compNum: 0,
								name: 'Early appointment',
								loc: '',
								alarm: [
									{
										action: 'DISPLAY',
										trigger: [{ rel: [{ neg: 'true', m: 5, related: 'START' }] }],
										desc: { description: '' }
									}
								]
							}
						],
						hasEx: false,
						fb: EVENT_DISPLAY_STATUS.FREE,
						fba: EVENT_DISPLAY_STATUS.FREE,
						fr: '',
						d: 1234,
						md: 0,
						ms: 0,
						ptst: PARTICIPATION_STATUS.ACCEPTED,
						rev: 0,
						status: 'CONF',
						transp: '',
						uid: '',
						compNum: 0,
						dur: 1800000,
						allDay: false,
						inst: [{ recur: false, ridZ: '', s: 0 }],
						draft: false,
						inviteId: 'early-invite-id',
						isOrg: false,
						loc: '',
						otherAtt: false,
						recur: false,
						l: 'some-caldav-child-folder-id',
						name: 'Early appointment',
						neverSent: false,
						or: {},
						s: 0,
						tags: []
					} as Appointment
				}
			}
		};

		const emptyStore = mockedData.store.mockReduxStore(fakeReducers);
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});

		setupTest(<AppointmentReminder />, { store });

		act(() => {
			vi.advanceTimersByTime(2000);
		});

		// No notification should fire because the folder store is empty
		expect(notificationSpy).not.toHaveBeenCalled();
		expect(playSpy).not.toHaveBeenCalled();
		expect(screen.queryByTestId('reminder-modal')).not.toBeInTheDocument();
	});

	test('does not notify for appointments from caldav child calendars', async () => {
		const caldavRootId = 'caldav-root-for-reminder';
		const caldavChildId = 'caldav-child-for-reminder';
		const notificationSpy = vi.spyOn(notifications, 'showNotification').mockImplementation(vi.fn());
		const playSpy = vi
			.spyOn(HTMLMediaElement.prototype, 'play')
			.mockImplementation(() => Promise.resolve());

		useFolderStore.setState((state) => ({
			...state,
			folders: {
				...state.folders,
				[caldavRootId]: {
					id: caldavRootId,
					name: 'CalDAV Root',
					dsId: 'caldav-ds-id',
					dsType: 'caldav',
					view: 'appointment',
					uuid: 'caldav-root-uuid',
					activesyncdisabled: false,
					recursive: true,
					deletable: true,
					isLink: false,
					depth: 1,
					children: []
				},
				[caldavChildId]: {
					id: caldavChildId,
					name: 'CalDAV Child',
					l: caldavRootId,
					view: 'appointment',
					uuid: 'caldav-child-uuid',
					activesyncdisabled: false,
					recursive: true,
					deletable: true,
					isLink: false,
					depth: 2,
					children: []
				}
			}
		}));

		const now = Date.now();
		const fakeReducers = {
			appointments: {
				appointments: {
					caldavAppt: {
						id: 'caldavAppt',
						class: 'PUB',
						flags: '',
						alarm: true,
						alarmData: [
							{
								nextAlarm: now - 1000,
								alarmInstStart: now - 1000,
								invId: 1,
								compNum: 0,
								name: 'CalDAV event',
								loc: '',
								alarm: [
									{
										action: 'DISPLAY',
										trigger: [{ rel: [{ neg: 'true', m: 5, related: 'START' }] }],
										desc: { description: '' }
									}
								]
							}
						],
						hasEx: false,
						fb: EVENT_DISPLAY_STATUS.FREE,
						fba: EVENT_DISPLAY_STATUS.FREE,
						fr: '',
						d: 1234,
						md: 0,
						ms: 0,
						ptst: PARTICIPATION_STATUS.ACCEPTED,
						rev: 0,
						status: 'CONF',
						transp: '',
						uid: '',
						compNum: 0,
						dur: 1800000,
						allDay: false,
						inst: [{ recur: false, ridZ: '', s: 0 }],
						draft: false,
						inviteId: 'caldav-invite-id',
						isOrg: false,
						loc: '',
						otherAtt: false,
						recur: false,
						l: caldavChildId,
						name: 'CalDAV event',
						neverSent: false,
						or: {},
						s: 0,
						tags: []
					} as Appointment
				}
			}
		};

		const emptyStore = mockedData.store.mockReduxStore(fakeReducers);
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});

		setupTest(<AppointmentReminder />, { store });

		act(() => {
			vi.advanceTimersByTime(2000);
		});

		expect(notificationSpy).not.toHaveBeenCalled();
		expect(playSpy).not.toHaveBeenCalled();
		expect(screen.queryByTestId('reminder-modal')).not.toBeInTheDocument();
	});
});
