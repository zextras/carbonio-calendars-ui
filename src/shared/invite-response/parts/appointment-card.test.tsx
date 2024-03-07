/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { screen } from '@testing-library/react';
import { map, values } from 'lodash';
import moment from 'moment';

import { AppointmentCard } from './appointment-card';
import { tags } from '../../../carbonio-ui-commons/test/mocks/tags/tags';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import mockedData from '../../../test/generators';
import 'jest-styled-components';

describe('appointment card component', () => {
	test.todo('on click it will change view and show the calendar event panel');
	test('it will have the background color of the calendar', () => {
		const event = mockedData.getEvent();
		setupTest(<AppointmentCard event={event} />);

		const card = screen.getByTestId(`cardContainer-${event.id}`);
		expect(card).toHaveStyleRule('background', event.resource.calendar.color.background);
	});
	test('it will have the border color of the calendar', () => {
		const event = mockedData.getEvent();
		setupTest(<AppointmentCard event={event} />);

		const card = screen.getByTestId(`cardContainer-${event.id}`);
		expect(card).toHaveStyleRule(
			'border',
			`0.0625rem solid ${event.resource.calendar.color.color}`
		);
	});
	test('it will have a calendar icon', () => {
		const event = mockedData.getEvent();
		setupTest(<AppointmentCard event={event} />);

		const calendarIcon = screen.getByTestId('icon: Calendar2');
		expect(calendarIcon).toBeVisible();
	});
	test('the calendar icon is the same color of the border', () => {
		const event = mockedData.getEvent();
		setupTest(<AppointmentCard event={event} />);

		const calendarIcon = screen.getByTestId('icon: Calendar2');
		expect(calendarIcon).toHaveStyleRule('color', event.resource.calendar.color.color);
	});
	describe('it will have a row composed by', () => {
		describe('the time of the event', () => {
			test('if it is a single day will show the hour start and end time', () => {
				const event = mockedData.getEvent();
				setupTest(<AppointmentCard event={event} />);

				const timeString = screen.getByText(
					`${moment(event.start).format('hh:mm A')} - ${moment(event.end).format('hh:mm A')}`
				);
				expect(timeString).toBeVisible();
			});
			test('if it is a single day all day it will show "all day"', () => {
				const event = mockedData.getEvent({ allDay: true });
				setupTest(<AppointmentCard event={event} />);

				const timeString = screen.getByText('All day');
				expect(timeString).toBeVisible();
			});
			test('if it is a multi day non all day it will show start and end including the days', () => {
				const event = mockedData.getEvent({ start: moment(), end: moment().add(2, 'day') });
				setupTest(<AppointmentCard event={event} />);

				const timeString = screen.getByText(
					`${moment(event.start).format('MMMM Do YYYY hh:mm A')} - ${moment(event.end).format(
						'MMMM Do YYYY hh:mm A'
					)}`
				);
				expect(timeString).toBeVisible();
			});
			test('if it is a multi day all day it will show start and end including the days and all day', () => {
				const event = mockedData.getEvent({
					start: moment(),
					end: moment().add(2, 'day'),
					allDay: true
				});
				setupTest(<AppointmentCard event={event} />);

				const string = `${moment(event.start).format('MMMM Do YYYY')} - ${moment(event.end).format(
					'MMMM Do YYYY'
				)} - All day`;
				const timeString = screen.getByText(string);
				expect(timeString).toBeVisible();
			});
		});
		describe('icons to inform the user when an event is', () => {
			test('private', () => {
				const event = mockedData.getEvent({ resource: { class: 'PRI' } });
				setupTest(<AppointmentCard event={event} />);

				const privateIcon = screen.getByTestId('icon: Lock');
				expect(privateIcon).toBeVisible();
			});
			test('tagged with single tag', () => {
				const event = mockedData.getEvent({ resource: { tags: [values(tags)[0].id] } });
				setupTest(<AppointmentCard event={event} />);
				const singleTagIcon = screen.getByTestId('TagSingleIcon');
				expect(singleTagIcon).toBeVisible();
			});
			test('tagged with multiple tags', () => {
				const event = mockedData.getEvent({ resource: { tags: map(tags, 'id') } });
				setupTest(<AppointmentCard event={event} />);
				const multiTagIcon = screen.getByTestId('TagMultiIcon');
				expect(multiTagIcon).toBeVisible();
			});
			test('answer is needed', () => {
				const event = mockedData.getEvent({
					resource: { iAmOrganizer: false, participationStatus: 'NE' }
				});
				setupTest(<AppointmentCard event={event} />);

				const needActionIcon = screen.getByTestId('icon: CalendarWarning');
				expect(needActionIcon).toBeVisible();
			});
			test('all of the above with single tag', () => {
				const event = mockedData.getEvent({
					resource: {
						iAmOrganizer: false,
						participationStatus: 'NE',
						tags: [values(tags)[0].id],
						class: 'PRI'
					}
				});
				setupTest(<AppointmentCard event={event} />);
				const singleTagIcon = screen.getByTestId('TagSingleIcon');
				const needActionIcon = screen.getByTestId('icon: CalendarWarning');
				const privateIcon = screen.getByTestId('icon: Lock');

				expect(privateIcon).toBeVisible();
				expect(singleTagIcon).toBeVisible();
				expect(needActionIcon).toBeVisible();
			});
		});
	});
	test('a second row with the title of the event', () => {
		const event = mockedData.getEvent();
		setupTest(<AppointmentCard event={event} />);

		const title = screen.getByText(event.title);
		expect(title).toBeVisible();
	});
});
