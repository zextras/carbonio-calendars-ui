/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { within } from '@testing-library/react';

import { setupTest, screen } from '../../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../../commons/editor-generator';
import { mockFreeBusyResponse } from '../../../../soap/test/mocks';
import { reducers } from '../../../../store/redux';
import mockedData from '../../../../test/generators';
import { CalendarSender, Resource } from '../../../../types/editor';
import { EditorChipAttendees } from '../../../../types/store/invite';
import { EditorDailyPlanner } from '../daily-planner';

const folder = {
	absFolderPath: '/Test',
	id: '5',
	l: '1',
	name: 'Test',
	view: 'appointment'
};

const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

describe('EditorDailyPlanner', () => {
	it('should render the daily planner component participants even without freebusy information', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		mockFreeBusyResponse([]);

		const organizer: CalendarSender = { address: 'organizer@test.com', fullName: 'Organizer' };
		const attendees: EditorChipAttendees[] = [
			{ email: 'attendee1@test.com' },
			{ email: 'attendee2@test.com' }
		];
		const optionalAttendees: EditorChipAttendees[] = [
			{
				email: 'optionalAttendee1@test.com'
			}
		];
		const meetingRoom: Resource = { email: 'meeting.room1@test.com', label: 'Meeting Room 1' };
		const equipment: Resource = { email: 'companyCar@test.com', label: 'Company Car' };
		const editor = generateEditor({
			context: {
				attendees,
				optionalAttendees,
				sender: organizer,
				meetingRoom: [meetingRoom],
				equipment: [equipment],
				folders,
				dispatch: store.dispatch
			}
		});

		setupTest(<EditorDailyPlanner editorId={editor.id} />, { store });
		const timeTable = screen.getByTestId(`time-table`);
		expect(timeTable).toBeInTheDocument();
		expect(within(timeTable).getByText('organizer@test.com')).toBeVisible();
		expect(within(timeTable).getByText('attendee1@test.com')).toBeVisible();
		expect(within(timeTable).getByText('attendee2@test.com')).toBeVisible();
		expect(within(timeTable).getByText('optionalAttendee1@test.com')).toBeVisible();
		expect(within(timeTable).getByText('companyCar@test.com')).toBeVisible();
		expect(within(timeTable).getByText('meeting.room1@test.com')).toBeVisible();
	});

	it('should call GetFreeBusy API with correct participants', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const interceptor = mockFreeBusyResponse([]);

		const organizer: CalendarSender = { address: 'organizer@test.com', fullName: 'Organizer' };
		const attendees: EditorChipAttendees[] = [
			{ email: 'attendee1@test.com' },
			{ email: 'attendee2@test.com' }
		];
		const optionalAttendees: EditorChipAttendees[] = [
			{
				email: 'optionalAttendee1@test.com'
			}
		];
		const meetingRoom: Resource = { email: 'meeting.room1@test.com', label: 'Meeting Room 1' };
		const equipment: Resource = { email: 'companyCar@test.com', label: 'Company Car' };
		const editor = generateEditor({
			context: {
				attendees,
				optionalAttendees,
				sender: organizer,
				meetingRoom: [meetingRoom],
				equipment: [equipment],
				folders,
				dispatch: store.dispatch
			}
		});

		setupTest(<EditorDailyPlanner editorId={editor.id} />, { store });

		const freeBusyRequest = await interceptor;
		expect(freeBusyRequest.uid).toBe(
			'organizer@test.com,attendee1@test.com,attendee2@test.com,meeting.room1@test.com,companyCar@test.com,optionalAttendee1@test.com'
		);
	});

	it('should call GetFreeBusy API with dates between current startDate midnight and next day midnight', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const interceptor = mockFreeBusyResponse([]);
		const start = new Date();
		const end = new Date(start);
		end.setDate(start.getDate() + 1);

		const organizer: CalendarSender = { address: 'organizer@test.com', fullName: 'Organizer' };
		const editor = generateEditor({
			context: {
				start: start.getTime(),
				end: end.getTime(),
				sender: organizer,
				folders,
				dispatch: store.dispatch
			}
		});

		setupTest(<EditorDailyPlanner editorId={editor.id} />, { store });

		const freeBusyRequest = await interceptor;
		const expectedStartDate = new Date(start);
		expectedStartDate.setHours(0, 0, 0, 0);
		const expectedEndDate = new Date(expectedStartDate);
		expectedEndDate.setDate(expectedStartDate.getDate() + 1);
		expect(freeBusyRequest.s).toBe(expectedStartDate.getTime());
		expect(freeBusyRequest.e).toBe(expectedEndDate.getTime());
	});

	it('should display organizer busy status', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const today = Date.now();
		const busyStart = new Date(today);
		busyStart.setHours(10, 30);
		const busyEnd = new Date(today);
		busyStart.setHours(15, 55);
		const freeBusyApiCall = mockFreeBusyResponse([
			{ id: 'organizer@test.com', f: [], b: [{ s: busyStart.getTime(), e: busyEnd.getTime() }] }
		]);

		const organizer: CalendarSender = { address: 'organizer@test.com', fullName: 'Organizer' };
		const editor = generateEditor({
			context: {
				sender: organizer,
				folders,
				dispatch: store.dispatch
			}
		});

		setupTest(<EditorDailyPlanner editorId={editor.id} />, { store });
		await freeBusyApiCall;

		const firstRow = within(screen.getByTestId('time-table')).getByTestId('row-organizer@test.com');
		const freeBusyColumn = within(firstRow).getByTestId('column-1');
		expect(await within(freeBusyColumn).findByTestId('busy')).toBeVisible();
	});

	it('should display People icon for organizer', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const organizer: CalendarSender = { address: 'organizer@test.com', fullName: 'Organizer' };
		const editor = generateEditor({
			context: {
				sender: organizer,
				folders,
				dispatch: store.dispatch
			}
		});
		setupTest(<EditorDailyPlanner editorId={editor.id} />, { store });
		const timeTable = screen.getByTestId('time-table');
		const firstRow = within(timeTable).getByTestId('row-organizer@test.com');
		const firstColumn = within(firstRow).getByTestId('column-0');
		expect(within(firstColumn).getByTestId('icon: Person')).toBeVisible();
	});
});
