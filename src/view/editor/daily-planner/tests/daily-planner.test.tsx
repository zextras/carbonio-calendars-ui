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
	it('should render the daily planner component', () => {
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
});
