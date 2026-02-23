/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { waitFor, within } from '@testing-library/react';

import { TEST_SELECTORS } from '../../../../constants/test-utils';
import * as handler from '../../../../soap/get-free-busy-request';
import { mockFreeBusyResponse, mockWorkingHoursResponse } from '../../../../soap/tests/mocks';
import { reducers } from '../../../../store/redux';
import { DAILY_PLANNER_PARTICIPANT_TYPE } from '../constants';
import { EditorDailyPlanner } from '../daily-planner';
import { setupTest, screen } from '@test-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { buildSoapErrorResponseBody } from '@test-utils/utils/soap';

const organizer = {
	email: 'organizer@test.com',
	type: DAILY_PLANNER_PARTICIPANT_TYPE.organizer
};
const attendees = [
	{ email: 'attendee1@test.com', type: DAILY_PLANNER_PARTICIPANT_TYPE.attendee },
	{ email: 'attendee2@test.com', type: DAILY_PLANNER_PARTICIPANT_TYPE.attendee }
];
const optionalAttendees = {
	email: 'optionalAttendee1@test.com',
	type: DAILY_PLANNER_PARTICIPANT_TYPE.optionalAttendee
};
const meetingRoom = {
	email: 'meeting.room1@test.com',
	label: 'Meeting Room 1',
	type: DAILY_PLANNER_PARTICIPANT_TYPE.meetingRoom
};
const equipment = {
	email: 'companyCar@test.com',
	label: 'Company Car',
	type: DAILY_PLANNER_PARTICIPANT_TYPE.equipment
};

const participants = [organizer, ...attendees, meetingRoom, equipment, optionalAttendees];

describe('EditorDailyPlanner', () => {
	it('should render the daily planner component participants even without freebusy information', async () => {
		const freeBusyInterceptor = mockFreeBusyResponse([]);
		const workingHoursInterceptor = mockWorkingHoursResponse([]);
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(
			<EditorDailyPlanner editorId={'1'} startDate={0} endDate={1} participants={participants} />,
			{ store }
		);

		vi.advanceTimersByTime(250);
		await freeBusyInterceptor;
		await workingHoursInterceptor;

		const timeTable = screen.getByTestId(`time-table`);
		expect(timeTable).toBeInTheDocument();
		expect(within(timeTable).getByText('Organizer - organizer@test.com')).toBeVisible();
		expect(within(timeTable).getByText('attendee1@test.com')).toBeVisible();
		expect(within(timeTable).getByText('attendee2@test.com')).toBeVisible();
		expect(within(timeTable).getByText('optionalAttendee1@test.com')).toBeVisible();
		expect(within(timeTable).getByText('companyCar@test.com')).toBeVisible();
		expect(within(timeTable).getByText('meeting.room1@test.com')).toBeVisible();
	});

	it('should call GetFreeBusy API with correct participants', async () => {
		const interceptor = mockFreeBusyResponse([]);
		mockWorkingHoursResponse([]);

		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(
			<EditorDailyPlanner editorId={'1'} startDate={0} endDate={1} participants={participants} />,
			{ store }
		);
		vi.advanceTimersByTime(250);
		const freeBusyRequest = await interceptor;
		expect(freeBusyRequest.uid).toBe(
			'organizer@test.com,attendee1@test.com,attendee2@test.com,meeting.room1@test.com,companyCar@test.com,optionalAttendee1@test.com'
		);
	});

	it('should call GetFreeBusy API with dates between current startDate midnight and next day midnight', async () => {
		const interceptor = mockFreeBusyResponse([]);
		mockWorkingHoursResponse([]);
		const start = new Date();
		const end = new Date(start);
		end.setDate(start.getDate() + 1);

		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(
			<EditorDailyPlanner
				editorId={'1'}
				startDate={start.getTime()}
				endDate={end.getTime()}
				participants={participants}
			/>,
			{ store }
		);

		vi.advanceTimersByTime(250);
		const freeBusyRequest = await interceptor;
		const expectedStartDate = new Date(start);
		expectedStartDate.setHours(0, 0, 0, 0);
		const expectedEndDate = new Date(expectedStartDate);
		expectedEndDate.setDate(expectedStartDate.getDate() + 1);
		expect(freeBusyRequest.s).toBe(expectedStartDate.getTime());
		expect(freeBusyRequest.e).toBe(expectedEndDate.getTime());
	});

	it('should display organizer busy status', async () => {
		const today = Date.now();
		const busyStart = new Date(today);
		busyStart.setHours(10, 30);
		const busyEnd = new Date(today);
		busyEnd.setHours(15, 55);
		const freeBusyApiCall = mockFreeBusyResponse([
			{ id: 'organizer@test.com', f: [], b: [{ s: busyStart.getTime(), e: busyEnd.getTime() }] }
		]);
		const workingHoursApiCall = mockWorkingHoursResponse([]);

		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(
			<EditorDailyPlanner editorId={'1'} startDate={0} endDate={1} participants={participants} />,
			{ store }
		);
		vi.advanceTimersByTime(250);
		await workingHoursApiCall;
		await freeBusyApiCall;

		const firstRow = within(screen.getByTestId('time-table')).getByTestId('row-organizer@test.com');
		const freeBusyColumn = within(firstRow).getByTestId('column-1');
		expect(await within(freeBusyColumn).findByTestId('busy')).toBeVisible();
	});

	it('should display organizer non-working hours', async () => {
		const today = Date.now();
		const nonWorkingHoursStart = new Date(today);
		nonWorkingHoursStart.setHours(10, 0);
		const nonWorkingHoursEnd = new Date(today);
		nonWorkingHoursEnd.setHours(16, 0);
		const freeBusyApiCall = mockFreeBusyResponse([]);
		const workingHoursApiCall = mockWorkingHoursResponse([
			{
				id: 'organizer@test.com',
				f: [],
				u: [{ s: nonWorkingHoursStart.getTime(), e: nonWorkingHoursEnd.getTime() }]
			}
		]);

		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(
			<EditorDailyPlanner editorId={'1'} startDate={0} endDate={1} participants={participants} />,
			{ store }
		);
		vi.advanceTimersByTime(250);
		await freeBusyApiCall;
		await workingHoursApiCall;

		const firstRow = within(screen.getByTestId('time-table')).getByTestId('row-organizer@test.com');
		const eventsColumn = within(firstRow).getByTestId('column-1');
		expect(await within(eventsColumn).findByTestId('non-working')).toBeVisible();
	});

	it('should display People icon for organizer', async () => {
		const freeBusyInterceptor = mockFreeBusyResponse([]);
		const workingHoursInterceptor = mockWorkingHoursResponse([]);

		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(
			<EditorDailyPlanner editorId={'1'} startDate={0} endDate={1} participants={participants} />,
			{ store }
		);

		vi.advanceTimersByTime(250);
		await freeBusyInterceptor;
		await workingHoursInterceptor;

		const timeTable = screen.getByTestId('time-table');
		const firstRow = within(timeTable).getByTestId('row-organizer@test.com');
		const firstColumn = within(firstRow).getByTestId('column-0');
		expect(within(firstColumn).getByTestId('icon: Person')).toBeVisible();
	});

	it('should display snackbar with error if working hours API fails', async () => {
		const freeBusyInterceptor = mockFreeBusyResponse([]);
		const failingInterceptor = createSoapAPIInterceptor(
			'GetWorkingHours',
			buildSoapErrorResponseBody()
		);
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(
			<EditorDailyPlanner editorId={'1'} startDate={0} endDate={1} participants={participants} />,
			{ store }
		);
		await freeBusyInterceptor;
		await failingInterceptor;
		const errorSnackbar = await screen.findByText('Something went wrong, please try again');
		expect(errorSnackbar).toBeVisible();
	});

	it('should display snackbar with error if FreeBusy API fails', async () => {
		const workingHoursInterceptor = mockWorkingHoursResponse([]);
		const failingInterceptor = createSoapAPIInterceptor(
			'GetFreeBusy',
			buildSoapErrorResponseBody()
		);
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(
			<EditorDailyPlanner editorId={'1'} startDate={0} endDate={1} participants={participants} />,
			{ store }
		);
		await workingHoursInterceptor;
		await failingInterceptor;
		await waitFor(async () => {
			const errorSnackbar = screen.getByText('Something went wrong, please try again');
			expect(errorSnackbar).toBeVisible();
		});
	});
	it('will call the API once', async () => {
		const spy = vi.spyOn(handler, 'getFreeBusyRequest');
		const workingHoursInterceptor = mockWorkingHoursResponse([]);

		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		const { user } = setupTest(
			<EditorDailyPlanner editorId={'1'} startDate={0} endDate={1} participants={participants} />,
			{ store }
		);
		vi.advanceTimersByTime(250);

		await workingHoursInterceptor;

		const rightArrowButton = screen.getByRoleWithIcon('button', {
			icon: TEST_SELECTORS.ICONS.rightArrow
		});
		await user.click(rightArrowButton);
		await user.click(rightArrowButton);
		await user.click(rightArrowButton);
		await user.click(rightArrowButton);

		vi.advanceTimersByTime(300);
		expect(spy).toHaveBeenCalledTimes(1);
	});
});
