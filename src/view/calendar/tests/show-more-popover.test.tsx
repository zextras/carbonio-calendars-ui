/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { act } from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { reducers } from '../../../store/redux';
import mockedData from '../../../test/generators';
import { ShowMorePopover } from '../show-more-popover';
import { screen, setupTest } from '@test-setup';

describe('show more popover', () => {
	const event1 = mockedData.getEvent({ title: 'new-event-1' });
	const event2 = mockedData.getEvent({ title: 'new-event-2' });
	const event3 = mockedData.getEvent({ title: 'new-event-3' });
	const event4 = mockedData.getEvent({ title: 'new-event-4' });
	const event5 = mockedData.getEvent({ title: 'new-event-5' });
	const events = [event1, event2, event3, event4, event5];
	const date = new Date();
	const store = configureStore({ reducer: combineReducers(reducers) });

	const title = new Intl.DateTimeFormat('en-US', {
		weekday: 'short',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(date);

	test('renders a localized title', () => {
		setupTest(
			<ShowMorePopover
				open
				events={events}
				onClose={vi.fn()}
				date={date}
				anchorRef={React.createRef()}
			/>,
			{
				store
			}
		);

		expect(screen.getByText(title)).toBeVisible();
	});

	test('clicking the close button will call the onClose function', async () => {
		const onClose = vi.fn();
		const { user } = setupTest(
			<ShowMorePopover
				open
				events={events}
				onClose={onClose}
				date={date}
				anchorRef={React.createRef()}
			/>,
			{
				store
			}
		);

		await user.click(screen.getByRoleWithIcon('button', { icon: 'icon: Close' }));

		expect(onClose).toHaveBeenCalledTimes(1);
	});
	test('hovering the close button will show a tooltip', async () => {
		const { user } = setupTest(
			<ShowMorePopover
				open
				events={events}
				onClose={vi.fn()}
				date={date}
				anchorRef={React.createRef()}
			/>,
			{
				store
			}
		);

		await user.hover(screen.getByTestId('icon: Close'));

		act(() => {
			vi.advanceTimersByTime(3000);
		});

		const closeTooltip = await screen.findByText(/Close/i);
		expect(closeTooltip).toBeVisible();
	});
	test('should render all the events', async () => {
		setupTest(
			<ShowMorePopover
				open
				events={events}
				onClose={vi.fn()}
				date={date}
				anchorRef={React.createRef()}
			/>,
			{
				store
			}
		);
		events.forEach((event) => {
			expect(screen.getByText(event.title)).toBeVisible();
		});
	});
});
