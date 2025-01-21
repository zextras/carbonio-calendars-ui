/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { AppointmentReminderItem } from './appointment-reminder-item';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { reducers } from '../../store/redux';
import { AlarmType } from '../../types/event';
/* - aggiungere nel reminder di un appuntamento una stringa:
  - la stringa recita "show event details"
  - la stringa è underlined
  - la stringa è blu
  - la stringa è cliccabile
- cliccando sulla stringa "show event details" questa cambierà in "hide event details"
- cliccando sulla stringa "show event details" partirà una richiesta al server
- se non si hanno ancora i dati da mostrare ci sarà uno shimmer component
- se si hanno i dati da mostrare allora saranno disponibili
- se non ci sono dettagli mostrerà una stringa specifica
- il container dei dati da mostrare ha una max height specifica */

describe('Appointment Reminder Item', () => {
	test('There is a "show event details" string', () => {
		const reminderItem = {
			start: new Date(),
			id: '1',
			inviteId: '1-2',
			calendar: {
				id: '10'
			},
			allDay: false,
			isRecurrent: false,
			end: new Date(),
			location: '',
			name: 'reminder item',
			isOrg: true,
			key: '123',
			alarmData: [
				{
					nextAlarm: new Date().getTime(),
					alarmInstStart: new Date().getTime(),
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
				} as AlarmType
			]
		};
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupTest(
			<AppointmentReminderItem
				reminderItem={reminderItem}
				toggleModal={jest.fn}
				removeReminder={jest.fn}
				setActiveReminder={jest.fn}
			/>,
			{ store }
		);
		expect(screen.getByText('show event details')).toBeVisible();
	});
});
