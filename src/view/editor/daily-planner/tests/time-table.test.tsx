/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { screen, within } from '@testing-library/react';

import { DAILY_PLANNER_EVENT_TYPE } from '../constants';
import { TimeTable } from '../time-table';
import { DailyPlannerRow } from '../types';
import { setupTest } from '@test-setup';

describe('Time Table', () => {
	const rows: DailyPlannerRow[] = [
		{
			email: 'organizer@test.com',
			participantType: 'organizer',
			events: []
		},
		{
			email: 'participant@test.com',
			participantType: 'attendee',
			events: []
		},
		{
			email: 'participant2@test.com',
			fullName: 'John Doe',
			participantType: 'attendee',
			events: []
		},
		{
			email: 'all_events@test.com',
			participantType: 'attendee',
			events: [
				{
					type: DAILY_PLANNER_EVENT_TYPE.unknown,
					startDateEpochMillis: 0,
					endDateEpochMillis: 100
				},
				{
					type: DAILY_PLANNER_EVENT_TYPE.outOfOffice,
					startDateEpochMillis: 100,
					endDateEpochMillis: 100
				},
				{
					type: DAILY_PLANNER_EVENT_TYPE.busy,
					startDateEpochMillis: 200,
					endDateEpochMillis: 100
				},
				{
					type: DAILY_PLANNER_EVENT_TYPE.free,
					startDateEpochMillis: 300,
					endDateEpochMillis: 100
				},
				{
					type: DAILY_PLANNER_EVENT_TYPE.tentative,
					startDateEpochMillis: 400,
					endDateEpochMillis: 100
				},
				{
					type: DAILY_PLANNER_EVENT_TYPE.nonWorking,
					startDateEpochMillis: 500,
					endDateEpochMillis: 100
				}
			]
		}
	];
	it('should display organizer email on first column of a row', () => {
		setupTest(<TimeTable appointmentStartDate={0} appointmentEndDate={0} rows={rows} />);
		const timeTable = screen.getByTestId('time-table');
		const firstRow = within(timeTable).getByTestId('row-organizer@test.com');
		const firstColumn = within(firstRow).getByTestId('column-0');
		expect(within(firstColumn).getByText('Organizer - organizer@test.com')).toBeVisible();
	});

	it('should display participant email on first column of the second row', () => {
		setupTest(<TimeTable appointmentStartDate={0} appointmentEndDate={0} rows={rows} />);
		const timeTable = screen.getByTestId('time-table');
		const secondRow = within(timeTable).getByTestId('row-participant@test.com');
		const firstColumn = within(secondRow).getByTestId('column-0');
		expect(within(firstColumn).getByText('participant@test.com')).toBeVisible();
	});

	it('should display start mark on a second column of a row', () => {
		setupTest(<TimeTable appointmentStartDate={0} appointmentEndDate={0} rows={rows} />);
		const timeTable = screen.getByTestId('time-table');
		const firstRow = within(timeTable).getByTestId('row-organizer@test.com');
		const secondColumn = within(firstRow).getByTestId('column-1');
		expect(within(secondColumn).getByTestId('start-mark')).toBeVisible();
	});

	it('should display events correctly on the second column of a row', () => {
		setupTest(<TimeTable appointmentStartDate={0} appointmentEndDate={0} rows={rows} />);
		const timeTable = screen.getByTestId('time-table');
		const firstRow = within(timeTable).getByTestId('row-all_events@test.com');
		const secondColumn = within(firstRow).getByTestId('column-1');
		expect(within(secondColumn).getByTestId(DAILY_PLANNER_EVENT_TYPE.nonWorking)).toBeVisible();
		expect(within(secondColumn).getByTestId(DAILY_PLANNER_EVENT_TYPE.tentative)).toBeVisible();
		expect(within(secondColumn).getByTestId(DAILY_PLANNER_EVENT_TYPE.busy)).toBeVisible();
		expect(within(secondColumn).getByTestId(DAILY_PLANNER_EVENT_TYPE.outOfOffice)).toBeVisible();
		expect(within(secondColumn).getByTestId(DAILY_PLANNER_EVENT_TYPE.free)).toBeVisible();
		expect(within(secondColumn).getByTestId(DAILY_PLANNER_EVENT_TYPE.unknown)).toBeVisible();
	});

	it('should display participant fullName when available', () => {
		setupTest(<TimeTable appointmentStartDate={0} appointmentEndDate={0} rows={rows} />);
		const timeTable = screen.getByTestId('time-table');
		const secondRow = within(timeTable).getByTestId('row-participant2@test.com');
		const firstColumn = within(secondRow).getByTestId('column-0');
		expect(within(firstColumn).getByText('John Doe')).toBeVisible();
	});
});
