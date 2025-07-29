/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { act } from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { reducers } from '../../../store/redux';
import mockedData from '../../../test/generators';
import { CustomShowMoreButton } from '../custom-show-more-button';
import { setupTest } from '@test-setup';

describe('Custom show more', () => {
	const event1 = mockedData.getEvent();
	const event2 = mockedData.getEvent();
	const event3 = mockedData.getEvent();
	const event4 = mockedData.getEvent();
	const event5 = mockedData.getEvent();
	const events = [event1, event2, event3, event4, event5];
	const remainingEvents = [event4, event5];

	test('Should render correctly', () => {
		setupTest(
			<CustomShowMoreButton
				events={events}
				remainingEvents={remainingEvents}
				slotDate={new Date()}
			/>
		);

		expect(screen.getByRole('button', { name: `+ ${remainingEvents.length} more` })).toBeVisible();
	});
	test('onHover will render a tooltip', async () => {
		const { user } = setupTest(
			<CustomShowMoreButton
				events={events}
				remainingEvents={remainingEvents}
				slotDate={new Date()}
			/>
		);

		await user.hover(screen.getByRole('button', { name: `+ ${remainingEvents.length} more` }));

		act(() => {
			jest.advanceTimersByTime(3000);
		});

		expect(screen.getByText(/Show all events for this day/i)).toBeVisible();
	});

	test('onClick will open the show more popper', async () => {
		const date = new Date();
		const store = configureStore({ reducer: combineReducers(reducers) });
		const { user } = setupTest(
			<CustomShowMoreButton events={events} remainingEvents={remainingEvents} slotDate={date} />,
			{
				store
			}
		);

		await user.click(screen.getByRole('button', { name: `+ ${remainingEvents.length} more` }));

		const title = new Intl.DateTimeFormat('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(date);

		expect(screen.getByText(title)).toBeVisible();
	});
	test.todo('onClose will close the show more popper');
});
