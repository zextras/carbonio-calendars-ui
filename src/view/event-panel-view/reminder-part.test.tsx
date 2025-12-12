/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { useTheme } from '@zextras/carbonio-design-system';
import { useFolderStore } from '@zextras/carbonio-ui-commons';
import { keyBy } from 'lodash';

import { ReminderPart } from './reminder-part';
import * as modifyAppointmentHandler from '../../store/actions/new-modify-appointment';
import { setupHook, setupTest } from '@test-setup';
import { generateRoots } from '@test-utils/folders/roots-generator';
import { reducers } from 'store/redux';
import mockedData from 'test/generators';
import generateInvite from 'test/generators/invite';

const invite = generateInvite({
	context: { alarmValue: '5', attendees: [] }
});

const mockEvent = mockedData.getEvent();

const roots = generateRoots();
const folder = mockedData.calendars.defaultCalendar;

const setupFoldersStore = (): void => {
	useFolderStore.setState(() => ({
		folders: {
			...keyBy(roots, 'id'),
			[folder.id]: folder
		}
	}));
};

describe('ReminderPart', () => {
	it('renders nothing if alarmString is falsy', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const { container } = setupTest(
			<ReminderPart alarmString="" invite={invite} event={mockEvent} />,
			{ store }
		);
		expect(container).toBeEmptyDOMElement();
	});

	it('renders the reminder button with alarmString', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		setupTest(<ReminderPart alarmString="5 minutes before" invite={invite} event={mockEvent} />, {
			store
		});
		expect(screen.getByRole('button', { name: /5 minutes before/i })).toBeVisible();
	});

	it('check the selected option has bold text', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const { user } = setupTest(
			<ReminderPart alarmString="5 minutes before" invite={invite} event={mockEvent} />,
			{
				store
			}
		);
		const { result } = setupHook(useTheme);

		const reminderButton = await screen.findByRole('button', { name: /5 minutes before/i });
		await user.click(reminderButton);

		const fiveMinuteBeforeElements = screen.getAllByText('5 minutes before');
		expect(fiveMinuteBeforeElements.length).toBe(2);
		fiveMinuteBeforeElements.forEach((el) => expect(el).toBeVisible());
		expect(fiveMinuteBeforeElements[1]).toHaveStyle(
			`font-weight: ${result.current.fonts.weight.bold}`
		);
	});

	it('renders all reminder options', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const { user } = setupTest(
			<ReminderPart alarmString="5 minutes before" invite={invite} event={mockEvent} />,
			{
				store
			}
		);

		const reminderButton = await screen.findByRole('button', { name: /5 minutes before/i });
		await user.click(reminderButton);

		expect(screen.getByText('Never')).toBeVisible();
		expect(screen.getByText('At the time of the event')).toBeVisible();
		expect(screen.getByText('1 minute before')).toBeVisible();
		const fiveMinuteBeforeElements = screen.getAllByText('5 minutes before');
		expect(fiveMinuteBeforeElements.length).toBe(2);
		fiveMinuteBeforeElements.forEach((el) => expect(el).toBeVisible());
		expect(screen.getByText('10 minutes before')).toBeVisible();
		expect(screen.getByText('15 minutes before')).toBeVisible();
		expect(screen.getByText('30 minutes before')).toBeVisible();
		expect(screen.getByText('45 minutes before')).toBeVisible();
		expect(screen.getByText('1 hour before')).toBeVisible();
		expect(screen.getByText('2 hours before')).toBeVisible();
		expect(screen.getByText('4 hours before')).toBeVisible();
		expect(screen.getByText('5 hours before')).toBeVisible();
		expect(screen.getByText('18 hours before')).toBeVisible();
		expect(screen.getByText('1 day before')).toBeVisible();
		expect(screen.getByText('2 days before')).toBeVisible();
		expect(screen.getByText('3 days before')).toBeVisible();
		expect(screen.getByText('4 days before')).toBeVisible();
		expect(screen.getByText('1 week before')).toBeVisible();
	});

	it.each([
		{ alarmValue: '0', label: 'Never', expectedReminder: '0' },
		{ alarmValue: '-1', label: 'At the time of the event', expectedReminder: '-1' },
		{ alarmValue: '1', label: '1 minute before', expectedReminder: '1' },
		{ alarmValue: '5', label: '5 minutes before', expectedReminder: '5' },
		{ alarmValue: '10', label: '10 minutes before', expectedReminder: '10' },
		{ alarmValue: '15', label: '15 minutes before', expectedReminder: '15' },
		{ alarmValue: '30', label: '30 minutes before', expectedReminder: '30' },
		{ alarmValue: '45', label: '45 minutes before', expectedReminder: '45' },
		{ alarmValue: '60', label: '1 hour before', expectedReminder: '60' },
		{ alarmValue: '120', label: '2 hours before', expectedReminder: '120' },
		{ alarmValue: '240', label: '4 hours before', expectedReminder: '240' },
		{ alarmValue: '300', label: '5 hours before', expectedReminder: '300' },
		{
			alarmValue: (18 * 60).toString(),
			label: '18 hours before',
			expectedReminder: (18 * 60).toString()
		},
		{
			alarmValue: (24 * 60).toString(),
			label: '1 day before',
			expectedReminder: (24 * 60).toString()
		},
		{
			alarmValue: (48 * 60).toString(),
			label: '2 days before',
			expectedReminder: (48 * 60).toString()
		},
		{
			alarmValue: (72 * 60).toString(),
			label: '3 days before',
			expectedReminder: (72 * 60).toString()
		},
		{
			alarmValue: (4 * 24 * 60).toString(),
			label: '4 days before',
			expectedReminder: (4 * 24 * 60).toString()
		},
		{
			alarmValue: (7 * 24 * 60).toString(),
			label: '1 week before',
			expectedReminder: (7 * 24 * 60).toString()
		}
	])(
		'calls setSnooze and dispatches modifyAppointment with correct params for alarmValue %p',
		async ({ alarmValue, label, expectedReminder }) => {
			setupFoldersStore();
			const store = configureStore({ reducer: combineReducers(reducers) });
			const modifyAppointmentSpy = vi.spyOn(modifyAppointmentHandler, 'modifyAppointment');

			const { user } = setupTest(
				<ReminderPart alarmString={label} invite={{ ...invite, alarmValue }} event={mockEvent} />,
				{ store }
			);

			const reminderButton = await screen.findByRole('button', { name: new RegExp(label, 'i') });
			await user.click(reminderButton);

			const option = screen.getAllByText(label);
			await user.click(option[1]);

			expect(modifyAppointmentSpy).toHaveBeenCalledTimes(1);
			expect(modifyAppointmentSpy.mock.calls[0][0].editor).toHaveProperty(
				'reminder',
				expectedReminder
			);
			expect(modifyAppointmentSpy.mock.calls[0][0]).toHaveProperty('draft', true);
		}
	);
});
