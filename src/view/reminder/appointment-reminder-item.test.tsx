/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { AppointmentReminderItem } from './appointment-reminder-item';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { reducers } from '../../store/redux';
import { generateReminderItem } from '../../test/generators/reminder';
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
	describe('Details expansion link', () => {
		it('shouldn\'t show a "Show event details" string if the appointment has no details to show', () => {
			const reminderItem = generateReminderItem({ location: '' });
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
			expect(screen.queryByText(/show event details/i)).not.toBeInTheDocument();
		});

		it('should show a "Show event details" string if the appointment has details to show', () => {
			const reminderItem = generateReminderItem({ location: faker.word.words() });
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
			expect(screen.getByText(/show event details/i)).toBeVisible();
		});

		it.todo('should render the text with a specific color');

		it.todo('should render the text with underline');

		it.todo('should render a pointer cursor on hover');

		it.todo('should change the "Show event details" string to "Hide event details" when clicked');

		it.todo('');
	});
});
