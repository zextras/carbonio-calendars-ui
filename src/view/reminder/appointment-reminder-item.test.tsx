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
import mockedData from '../../test/generators';
import { generateReminderItem } from '../../test/generators/reminder';
import { Appointment } from '../../types/store/appointments';
import { Invite } from '../../types/store/invite';
import { AppointmentsSlice, InvitesSlice } from '../../types/store/store';

const initializeMockedStore = ({
	invite,
	appointment
}: {
	invite?: Invite;
	appointment?: Appointment;
}): ReturnType<typeof configureStore> => {
	const mockedInviteSlice: Partial<InvitesSlice> = {
		invites: invite ? { [invite.id]: invite } : {}
	};

	const mockedAppointmentSlice: Partial<AppointmentsSlice> = {
		appointments: appointment ? { [appointment.id]: appointment } : {}
	};

	const mockedStore = mockedData.store.mockReduxStore({
		invites: mockedInviteSlice,
		appointments: mockedAppointmentSlice
	});

	return configureStore({
		reducer: combineReducers(reducers),
		preloadedState: mockedStore
	});
};

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
		it('should show a "Show details" string ', () => {
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
		});

		it('should show a "Show details" string if the appointment has details to show', () => {
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

			expect(screen.getByText(/show details/i)).toBeVisible();
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

			const showDetailsText = screen.getByText(/show details/i);

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

			const showDetailsText = screen.getByText(/show details/i);

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

			const showDetailsText = screen.getByText(/show details/i);

			expect(showDetailsText).toHaveStyle({ cursor: 'pointer' });
		});

		it('should change the "Show details" string to "Hide details" when clicked and the there is at least a detail to show', async () => {
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

			await user.click(screen.getByText(/show details/i));

			expect(screen.getByText(/hide details/i)).toBeVisible();
		});
	});
});
