/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, waitFor } from '@testing-library/react';
import { find } from 'lodash';
import moment from 'moment';

import * as shell from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import defaultSettings from '../carbonio-ui-commons/test/mocks/settings/default-settings';
import { setupTest } from '../carbonio-ui-commons/test/test-setup';
import { reducers } from '../store/redux';
import mockedData from '../test/generators';
import { Appointment } from '../types/store/appointments';
import { DeleteEventModal } from '../view/modals/delete-event-modal';

shell.getUserSettings.mockImplementation(() => defaultSettings);
// the entire test suites is skipped because it is going to be removed once "IRIS-4483" will be completed
describe.skip('Delete event modal', () => {
	const SERIES_RIDZ = '20230302';
	const INSTANCE_RIDZ = '20230301';
	const EXCEPTION_RIDZ = '20230228';
	const SERIES_FIRST_RIDZ = '20230227';

	const event = mockedData.getEvent({ resource: { ridZ: 'undefined', isRecurrent: false } });
	const exceptionEvent = mockedData.getEvent({
		start: new Date(moment(`${EXCEPTION_RIDZ}T120000Z`).valueOf()),
		end: new Date(moment(`${EXCEPTION_RIDZ}T123000Z`).valueOf()),
		resource: {
			ridZ: `${EXCEPTION_RIDZ}T120000Z`,
			isRecurrent: false,
			isException: true,
			hasException: true
		}
	});
	const instanceEvent = {
		...exceptionEvent,
		start: new Date(moment(`${INSTANCE_RIDZ}T120000Z`).valueOf()),
		end: new Date(moment(`${INSTANCE_RIDZ}T123000Z`).valueOf()),
		resource: {
			...exceptionEvent.resource,
			ridZ: `${INSTANCE_RIDZ}T120000Z`,
			isRecurrent: false,
			isException: false
		}
	};
	const seriesEvent = {
		...instanceEvent,
		start: new Date(moment(`${SERIES_RIDZ}T120000Z`).valueOf()),
		end: new Date(moment(`${SERIES_RIDZ}T123000Z`).valueOf()),
		resource: {
			...instanceEvent.resource,
			ridZ: undefined,
			isRecurrent: true,
			isException: false
		}
	};

	const seriesFirstInstanceEvent = {
		...seriesEvent,
		start: new Date(moment(`${SERIES_FIRST_RIDZ}T120000Z`).valueOf()),
		end: new Date(moment(`${SERIES_FIRST_RIDZ}T123000Z`).valueOf()),
		resource: {
			...seriesEvent.resource,
			ridZ: undefined,
			isRecurrent: true,
			isException: false
		}
	};

	const invite = mockedData.getInvite({
		event,
		context: { exceptId: [{ d: `${EXCEPTION_RIDZ}T130000`, tz: 'Europe/Berlin' }] }
	});
	const exceptionInvite = mockedData.getInvite({ event: exceptionEvent });
	const instanceInvite = mockedData.getInvite({
		event: instanceEvent,
		context: {
			start: {
				d: `${SERIES_FIRST_RIDZ}T110000`,
				tz: 'Europe/Berlin',
				u: moment(`${SERIES_FIRST_RIDZ}T120000Z`).valueOf()
			},
			end: {
				d: `${SERIES_FIRST_RIDZ}T113000`,
				tz: 'Europe/Berlin',
				u: moment(`${SERIES_FIRST_RIDZ}T120000Z`).valueOf()
			},
			recurrenceRule: [
				{
					add: [
						{
							rule: [
								{
									freq: 'DAI',
									until: [
										{
											d: `${SERIES_FIRST_RIDZ}T120000Z`
										}
									],
									interval: [
										{
											ival: 1
										}
									]
								}
							]
						}
					]
				}
			]
		}
	});

	const invites = {
		invites: {
			[invite.id]: invite,
			[exceptionInvite.id]: exceptionInvite,
			[instanceInvite.id]: instanceInvite
		}
	};

	const appointments = {
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
				fb: 'F',
				fr: '',
				d: 1234,
				fba: '',
				md: 0,
				ms: 0,
				ptst: 'AC',
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
			[exceptionEvent.resource.id]: {
				id: exceptionEvent.resource.id,
				class: 'PUB',
				flags: '',
				alarm: true,
				alarmData: [
					{
						nextAlarm: exceptionEvent.resource.alarmData?.[0]?.alarmInstStart,
						alarmInstStart: exceptionEvent.resource.alarmData?.[0]?.alarmInstStart,
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
				hasEx: true,
				fb: 'F',
				fr: '',
				d: 1234,
				fba: '',
				md: 0,
				ms: 0,
				ptst: 'AC',
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
						ridZ: `${SERIES_FIRST_RIDZ}T120000Z`,
						s: 0
					},
					{
						recur: false,
						ridZ: `${EXCEPTION_RIDZ}T120000Z`,
						s: 0,
						ex: true
					},
					{
						recur: false,
						ridZ: `${INSTANCE_RIDZ}T120000Z`,
						s: 0
					},
					{
						recur: false,
						ridZ: `${SERIES_RIDZ}T120000Z`,
						s: 0
					}
				],
				draft: false,
				inviteId: exceptionEvent.resource.inviteId,
				isOrg: exceptionEvent.resource.iAmOrganizer,
				loc: exceptionEvent.resource.location,
				otherAtt: false,
				recur: true,
				l: exceptionEvent.resource.calendar.id,
				name: exceptionEvent.title,
				neverSent: false,
				or: {},
				s: 0,
				tags: []
			} as Appointment
		}
	};

	const emptyStore = mockedData.store.mockReduxStore({ invites, appointments });

	test('delete single appointment', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		const onClose = jest.fn();
		const { user } = setupTest(
			<DeleteEventModal event={event} invite={invite} onClose={onClose} />,
			{ store }
		);
		await waitFor(() => {
			user.click(screen.getByText(/action\.send_cancellation/i));
		});
		const newStore = store.getState().appointments.appointments[event.resource.id];
		expect(newStore.l).toBe('3');
		const snackbar = await screen.findByText(/Appointment moved to trash/i);
		expect(snackbar).toBeVisible();
	});

	test('delete exception', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		const onClose = jest.fn();
		const { user } = setupTest(
			<DeleteEventModal event={exceptionEvent} invite={exceptionInvite} onClose={onClose} />,
			{ store }
		);
		await waitFor(() => {
			user.click(screen.getByText(/action\.send_cancellation/i));
		});
		const exceptionNewStore =
			store.getState().appointments.appointments[exceptionEvent.resource.id];
		expect(exceptionNewStore.l).toBe('10');
		const exceptionSnackbar = await screen.findByText(/Appointment permanently deleted/i);
		const exceptionInstance = find(exceptionNewStore.inst, ['ex', true]);
		expect(exceptionInstance).toBeUndefined();
		expect(exceptionSnackbar).toBeVisible();
	});

	test('delete single istance of a series', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		const onClose = jest.fn();
		const { user } = setupTest(
			<DeleteEventModal event={instanceEvent} invite={instanceInvite} onClose={onClose} />,
			{ store }
		);
		await waitFor(() => {
			user.click(screen.getByText(/action\.send_cancellation/i));
		});
		const instanceNewStore = store.getState().appointments.appointments[instanceEvent.resource.id];
		expect(instanceNewStore.l).toBe('10');
		const instanceSnackbar = await screen.findByText(/Appointment permanently deleted/i);
		const instance = find(instanceNewStore.inst, ['ridZ', `${INSTANCE_RIDZ}T120000Z`]);
		expect(instance).toBeUndefined();
		expect(instanceSnackbar).toBeVisible();
	});

	test('delete series - if all occurrences is selected, appointment is moved to thrash', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		const onClose = jest.fn();
		const { user } = setupTest(
			<DeleteEventModal event={seriesEvent} invite={instanceInvite} onClose={onClose} />,
			{ store }
		);
		await waitFor(() => {
			user.click(screen.getByRole('button', { name: /label\.delete/i }));
		});
		await waitFor(() => {
			user.click(screen.getByText(/action\.send_cancellation/i));
		});
		const seriesNewStore = store.getState().appointments.appointments[seriesEvent.resource.id];
		expect(seriesNewStore.l).toBe('3');
		const seriesSnackbar = await screen.findByText(
			/Series successfully deleted. Attendees will receive the cancellation notification./i
		);
		expect(seriesSnackbar).toBeVisible();
	});

	test('delete series - if future occurrences is selected, appointment is not moved to thrash', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		const onClose = jest.fn();
		const { user } = setupTest(
			<DeleteEventModal event={seriesEvent} invite={instanceInvite} onClose={onClose} />,
			{ store }
		);
		await waitFor(() => {
			user.click(screen.getByTestId('icon: Square'));
		});
		await waitFor(() => {
			user.click(screen.getByRole('button', { name: /label\.delete/i }));
		});
		await waitFor(() => {
			user.click(screen.getByText(/action\.send_cancellation/i));
		});
		const newStore = store.getState().appointments.appointments[seriesEvent.resource.id];
		expect(newStore.l).toBe('10');
		const futureOccurrenciesSnackbar = await screen.findByText(
			/Series successfully deleted. Attendees will receive the cancellation notification./i
		);
		expect(futureOccurrenciesSnackbar).toBeVisible();
	});

	test('delete series - if first istance of future occurrences is selected, appointment is moved to thrash', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		const onClose = jest.fn();
		const { user } = setupTest(
			<DeleteEventModal
				event={seriesFirstInstanceEvent}
				invite={instanceInvite}
				onClose={onClose}
			/>,
			{ store }
		);
		await waitFor(() => {
			user.click(screen.getByTestId('icon: Square'));
		});
		await waitFor(() => {
			user.click(screen.getByRole('button', { name: /label\.delete/i }));
		});
		await waitFor(() => {
			user.click(screen.getByText(/action\.send_cancellation/i));
		});
		const newStore = store.getState().appointments.appointments[seriesEvent.resource.id];
		expect(newStore.l).toBe('3');
		const futureOccurrenciesSnackbar = await screen.findByText(
			/Series successfully deleted. Attendees will receive the cancellation notification./i
		);
		expect(futureOccurrenciesSnackbar).toBeVisible();
	});
});
