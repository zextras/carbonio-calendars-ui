/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import moment from 'moment-timezone';
import { useTheme } from 'styled-components';

import { AppointmentReminderItem } from './appointment-reminder-item';
import { screen, setupHook, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { reducers } from '../../store/redux';
import { generateReminderItem } from '../../test/generators/reminder';

describe('Appointment Reminder Item', () => {
	it('should render the icon', () => {
		const reminderItem = generateReminderItem();
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

		expect(screen.getByTestId('icon: PhoneCallOutline')).toBeVisible();
	});

	it('should render the appointment name', () => {
		const reminderItem = generateReminderItem();
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

		expect(screen.getByText(reminderItem.name)).toBeVisible();
	});

	it('should render the appointment time', () => {
		const reminderItem = generateReminderItem();
		const store = configureStore({ reducer: combineReducers(reducers) });
		const timeText = `${moment(reminderItem.start).format('HH:mm')} - ${moment(reminderItem.end).format('HH:mm')}`;

		setupTest(
			<AppointmentReminderItem
				reminderItem={reminderItem}
				toggleModal={jest.fn}
				removeReminder={jest.fn}
				setActiveReminder={jest.fn}
			/>,
			{ store }
		);

		expect(screen.getByText(timeText)).toBeVisible();
	});

	it.todo('should render the appointment status');

	it.todo("should render a button to snooze the reminder if the appointment isn't started yet");

	it.todo(
		'should render a button to set a new time for the appointment if the appointment is started'
	);

	it.todo('should render a button to dismiss the reminder');

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
			const reminderItem = generateReminderItem({ location: faker.internet.url() });
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

		it('should render the text with a specific color', () => {
			const reminderItem = generateReminderItem({ location: faker.internet.url() });
			const store = configureStore({ reducer: combineReducers(reducers) });
			const {
				result: { current: theme }
			} = setupHook(useTheme);

			setupTest(
				<AppointmentReminderItem
					reminderItem={reminderItem}
					toggleModal={jest.fn}
					removeReminder={jest.fn}
					setActiveReminder={jest.fn}
				/>,
				{ store }
			);

			const showDetailsText = screen.getByText(/show event details/i);

			/*
			 * FIXME change the color variant from hover to regular as soon as
			 *  the https://github.com/testing-library/jest-dom/issues/594 issue is fixed
			 */
			expect(showDetailsText).toHaveStyle({ color: theme.palette.info.hover });
		});

		it('should render the text with underline', () => {
			const reminderItem = generateReminderItem({ location: faker.internet.url() });
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

			const showDetailsText = screen.getByText(/show event details/i);

			expect(showDetailsText).toHaveStyle({ textDecoration: 'underline' });
		});

		it('should render a pointer cursor on hover', () => {
			const reminderItem = generateReminderItem({ location: faker.internet.url() });
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

			const showDetailsText = screen.getByText(/show event details/i);

			expect(showDetailsText).toHaveStyle({ cursor: 'pointer' });
		});

		it('should change the "Show event details" string to "Hide event details" when clicked', async () => {
			const reminderItem = generateReminderItem({ location: faker.internet.url() });
			const store = configureStore({ reducer: combineReducers(reducers) });

			const { user } = setupTest(
				<AppointmentReminderItem
					reminderItem={reminderItem}
					toggleModal={jest.fn}
					removeReminder={jest.fn}
					setActiveReminder={jest.fn}
				/>,
				{ store }
			);

			await user.click(screen.getByText(/show event details/i));

			expect(screen.getByText(/hide event details/i)).toBeVisible();
		});

		it('should hide the location URL as default behaviour', async () => {
			const locationUrl = faker.internet.url();
			const reminderItem = generateReminderItem({ location: locationUrl });
			const store = configureStore({ reducer: combineReducers(reducers) });

			const { user } = setupTest(
				<AppointmentReminderItem
					reminderItem={reminderItem}
					toggleModal={jest.fn}
					removeReminder={jest.fn}
					setActiveReminder={jest.fn}
				/>,
				{ store }
			);

			expect(screen.queryByText(locationUrl)).not.toBeInTheDocument();
		});

		it('should set the location URL as visible when the "Show event details" string is clicked', async () => {
			const locationUrl = faker.internet.url();
			const reminderItem = generateReminderItem({ location: locationUrl });
			const store = configureStore({ reducer: combineReducers(reducers) });

			const { user } = setupTest(
				<AppointmentReminderItem
					reminderItem={reminderItem}
					toggleModal={jest.fn}
					removeReminder={jest.fn}
					setActiveReminder={jest.fn}
				/>,
				{ store }
			);

			await user.click(screen.getByText(/show event details/i));

			expect(screen.getByText(locationUrl)).toBeVisible();
		});

		it('should set the location URL as hidden when the "Hide event details" string is clicked', async () => {
			const locationUrl = faker.internet.url();
			const reminderItem = generateReminderItem({ location: locationUrl });
			const store = configureStore({ reducer: combineReducers(reducers) });

			const { user } = setupTest(
				<AppointmentReminderItem
					reminderItem={reminderItem}
					toggleModal={jest.fn}
					removeReminder={jest.fn}
					setActiveReminder={jest.fn}
				/>,
				{ store }
			);

			await user.click(screen.getByText(/show event details/i));

			await user.click(screen.getByText(/hide event details/i));

			expect(screen.queryByText(locationUrl)).not.toBeInTheDocument();
		});
	});
});
