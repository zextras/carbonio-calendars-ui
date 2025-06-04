/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';

import { TitleRow } from './title-row';
import mockedData from '../../test/generators';
import { EventResourceCalendar } from '../../types/event';
import { setupTest } from '@test-setup';

type EventProps = [
	eventClass: 'PRI' | 'PUB',
	iAmOrganizer: boolean,
	calendar: EventResourceCalendar
];

const ownedCalendar = {
	id: '10',
	name: 'calendar',
	color: { color: '#000000', background: '#E6E9ED', label: 'black' }
};

const sharedCalendar = {
	id: 'shared:10',
	name: 'shared:calendar',
	color: { color: '#000000', background: '#E6E9ED', label: 'black' },
	owner: 'userB@userBDomain.com'
};

describe('title-row', () => {
	describe('title', () => {
		describe('the title of the appointment will be visible', () => {
			it.each<EventProps>([
				['PUB', true, ownedCalendar],
				['PRI', true, ownedCalendar],
				['PUB', false, ownedCalendar],
				['PRI', false, ownedCalendar],
				['PUB', false, sharedCalendar]
			])('when class is %s and user organizer is %s %p', (eventClass, iAmOrganizer, calendar) => {
				const event = mockedData.getEvent({
					resource: {
						iAmOrganizer,
						iAmAttendee: !iAmOrganizer && !!ownedCalendar,
						class: eventClass,
						calendar
					}
				});

				setupTest(<TitleRow event={event} />);

				expect(screen.getByText(event.title)).toBeInTheDocument();
			});
		});
		test('the title of the appointment will show "private" label', () => {
			const event = mockedData.getEvent({
				title: '',
				resource: {
					iAmOrganizer: false,
					iAmAttendee: false,
					class: 'PRI',
					calendar: sharedCalendar
				}
			});

			setupTest(<TitleRow event={event} />);

			expect(screen.getByText(/private/i)).toBeInTheDocument();
		});
	});
	describe('recurrent icon', () => {
		test('if the event is not part of a recurrence it wont have a recurrent icon', async () => {
			const event = mockedData.getEvent();

			setupTest(<TitleRow event={event} />);

			expect(screen.queryByTestId('icon: Repeat')).not.toBeInTheDocument();
		});
		test('if the event is part of a recurrence it will have a recurrent icon', async () => {
			const event = mockedData.getEvent({ resource: { isRecurrent: true } });

			setupTest(<TitleRow event={event} />);

			expect(screen.getByTestId('icon: Repeat')).toBeVisible();
		});
	});
});
