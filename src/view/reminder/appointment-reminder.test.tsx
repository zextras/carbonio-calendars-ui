/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen, waitFor } from '@testing-library/react';

import { AppointmentReminder } from './appointment-reminder';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { deleteAppointmentPermanent } from '../../store/actions/delete-appointment-permanent';
import { reducers } from '../../store/redux';
import mockedData from '../../test/generators';
import { Appointment } from '../../types/store/appointments';

jest.setTimeout(40000);

describe('appointment reminders', () => {
	test("'when the appointment is deleted also the relative reminder is deleted", async () => {
		const event = mockedData.getEvent();
		const event2 = mockedData.getEvent();
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
			jest.advanceTimersByTime(diff + 12345);
		});

		expect(screen.getByTestId('reminder-modal')).toBeInTheDocument();

		await waitFor(() => {
			store.dispatch(
				deleteAppointmentPermanent({
					id: event2.resource.id
				})
			);
		});

		await waitFor(() => {
			store.dispatch(
				deleteAppointmentPermanent({
					id: event.resource.id
				})
			);
		});

		act(() => {
			jest.advanceTimersByTime(1000);
		});

		expect(screen.queryByTestId('reminder-modal')).not.toBeInTheDocument();
	});
});
