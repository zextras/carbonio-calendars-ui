/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useTheme } from '@zextras/carbonio-design-system';
import moment from 'moment-timezone';

import { AppointmentReminderItem } from './appointment-reminder-item';
import { reducers } from '../../store/redux';
import { generateReminderItem } from '../../test/generators/reminder';
import { setupHook, setupTest, screen } from '@test-setup';

describe('Appointment Reminder Item', () => {
	it('should render the icon', () => {
		const reminderItem = generateReminderItem();
		const store = configureStore({ reducer: combineReducers(reducers) });

		setupTest(
			<AppointmentReminderItem
				reminderItem={reminderItem}
				toggleModal={vi.fn()}
				removeReminder={vi.fn()}
				setActiveReminder={vi.fn()}
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
				toggleModal={vi.fn()}
				removeReminder={vi.fn()}
				setActiveReminder={vi.fn()}
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
				toggleModal={vi.fn()}
				removeReminder={vi.fn()}
				setActiveReminder={vi.fn()}
			/>,
			{ store }
		);

		expect(screen.getByText(timeText)).toBeVisible();
	});

	it('should render a button to snooze the reminder if the appointment is not started yet and user is not organizer', async () => {
		const reminderItem = generateReminderItem({
			start: moment().add(1, 'hour').toDate(),
			isOrg: false,
			alarmData: [
				{
					alarmInstStart: moment().add(1, 'hour').valueOf(),
					alarm: [
						{
							action: 'DISPLAY',
							desc: { description: 'description' },
							trigger: [
								{
									rel: [
										{
											neg: 'true',
											related: 'START'
										}
									]
								}
							]
						}
					],
					compNum: 0,
					invId: 0,
					loc: '',
					name: '',
					nextAlarm: 0
				}
			]
		});
		const store = configureStore({ reducer: combineReducers(reducers) });

		setupTest(
			<AppointmentReminderItem
				reminderItem={reminderItem}
				toggleModal={vi.fn()}
				removeReminder={vi.fn()}
				setActiveReminder={vi.fn()}
			/>,
			{ store }
		);

		// Snooze button should be visible
		const snoozeButton = await screen.findByTestId('icon: ClockOutline');
		expect(snoozeButton).toBeVisible();
	});

	it('should render a button to set a new time for the appointment if the appointment is started and user is organizer', async () => {
		const reminderItem = generateReminderItem({
			start: moment().subtract(1, 'hour').toDate(),
			isOrg: true,
			alarmData: [
				{
					alarmInstStart: moment().add(1, 'hour').valueOf(),
					alarm: [
						{
							action: 'DISPLAY',
							desc: { description: 'description' },
							trigger: [
								{
									rel: [
										{
											neg: 'true',
											related: 'START'
										}
									]
								}
							]
						}
					],
					compNum: 0,
					invId: 0,
					loc: '',
					name: '',
					nextAlarm: 0
				}
			]
		});
		const store = configureStore({ reducer: combineReducers(reducers) });

		setupTest(
			<AppointmentReminderItem
				reminderItem={reminderItem}
				toggleModal={vi.fn()}
				removeReminder={vi.fn()}
				setActiveReminder={vi.fn()}
			/>,
			{ store }
		);

		// Reschedule button should be visible
		const rescheduleButton = await screen.findByTestId('icon: CalendarOutline');
		expect(rescheduleButton).toBeVisible();
	});

	it('should render a button to dismiss the reminder', async () => {
		const reminderItem = generateReminderItem();
		const store = configureStore({ reducer: combineReducers(reducers) });

		setupTest(
			<AppointmentReminderItem
				reminderItem={reminderItem}
				toggleModal={vi.fn()}
				removeReminder={vi.fn()}
				setActiveReminder={vi.fn()}
			/>,
			{ store }
		);

		const dismissButton = await screen.findByTestId('icon: BellOffOutline');
		expect(dismissButton).toBeVisible();
	});

	it('should call setActiveReminder and toggleModal when reschedule button is clicked', async () => {
		const setActiveReminder = vi.fn();
		const toggleModal = vi.fn();
		const reminderItem = generateReminderItem({
			start: moment().subtract(1, 'hour').toDate(),
			isOrg: true,
			alarmData: [
				{
					alarmInstStart: moment().add(1, 'hour').valueOf(),
					alarm: [
						{
							action: 'DISPLAY',
							desc: { description: 'description' },
							trigger: [
								{
									rel: [
										{
											neg: 'true',
											related: 'START'
										}
									]
								}
							]
						}
					],
					compNum: 0,
					invId: 0,
					loc: '',
					name: '',
					nextAlarm: 0
				}
			]
		});
		const store = configureStore({ reducer: combineReducers(reducers) });

		const { user } = setupTest(
			<AppointmentReminderItem
				reminderItem={reminderItem}
				toggleModal={toggleModal}
				removeReminder={vi.fn()}
				setActiveReminder={setActiveReminder}
			/>,
			{ store }
		);

		const rescheduleButton = await screen.findByTestId('icon: CalendarOutline');
		await user.click(rescheduleButton);

		expect(setActiveReminder).toHaveBeenCalledWith(reminderItem);
		expect(toggleModal).toHaveBeenCalled();
	});

	it('should call removeReminder when dismiss icon button is clicked', async () => {
		const removeReminder = vi.fn();
		const reminderItem = generateReminderItem();
		const store = configureStore({ reducer: combineReducers(reducers) });

		const { user } = setupTest(
			<AppointmentReminderItem
				reminderItem={reminderItem}
				toggleModal={vi.fn()}
				removeReminder={removeReminder}
				setActiveReminder={vi.fn()}
			/>,
			{ store }
		);

		const dismissButton = await screen.findByTestId('icon: BellOffOutline');
		await user.click(dismissButton);

		expect(removeReminder).toHaveBeenCalledWith(reminderItem.key);
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
					toggleModal={vi.fn()}
					removeReminder={vi.fn()}
					setActiveReminder={vi.fn()}
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
					toggleModal={vi.fn()}
					removeReminder={vi.fn()}
					setActiveReminder={vi.fn()}
				/>,
				{ store }
			);

			expect(screen.getByText(/show details/i)).toBeVisible();
		});

		it('should render the text with a specific color', async () => {
			const reminderItem = generateReminderItem({ location: faker.internet.url() });
			const store = configureStore({ reducer: combineReducers(reducers) });
			const {
				result: { current: theme }
			} = setupHook(useTheme);

			setupTest(
				<AppointmentReminderItem
					reminderItem={reminderItem}
					toggleModal={vi.fn()}
					removeReminder={vi.fn()}
					setActiveReminder={vi.fn()}
				/>,
				{ store }
			);

			const showDetailsText = screen.getByText(/show details/i);

			expect(showDetailsText).toHaveStyle({ color: theme.palette.info.regular });
		});

		it('should render the text with underline', () => {
			const reminderItem = generateReminderItem({ location: faker.internet.url() });
			const store = configureStore({ reducer: combineReducers(reducers) });

			setupTest(
				<AppointmentReminderItem
					reminderItem={reminderItem}
					toggleModal={vi.fn()}
					removeReminder={vi.fn()}
					setActiveReminder={vi.fn()}
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
					toggleModal={vi.fn()}
					removeReminder={vi.fn()}
					setActiveReminder={vi.fn()}
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
					toggleModal={vi.fn()}
					removeReminder={vi.fn()}
					setActiveReminder={vi.fn()}
				/>,
				{ store }
			);

			await user.click(screen.getByText(/show details/i));

			expect(screen.getByText(/hide details/i)).toBeVisible();
		});
	});
});
