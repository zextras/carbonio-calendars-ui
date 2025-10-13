/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { ReminderPart } from './reminder-part';
import { setupTest } from '@test-setup';
import { reducers } from 'store/redux';
import mockedData from 'test/generators';
import generateInvite from 'test/generators/invite';

const invite = generateInvite({
	context: { alarmValue: '5', attendees: [] }
});

const mockEvent = mockedData.getEvent();

describe('ReminderPart', () => {
	it('renders nothing if alarmString is falsy', () => {
		// const reminderItem = generateReminderItem();
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
});
