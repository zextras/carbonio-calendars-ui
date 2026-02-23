/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse } from 'msw';

import { generateEditor } from '../../../../commons/editor-generator';
import { mockFreeBusyResponse, mockWorkingHoursResponse } from '../../../../soap/tests/mocks';
import { reducers } from '../../../../store/redux';
import mockedData from '../../../../test/generators';
import { EditorDailyPlannerController } from '../daily-planner-controller';
import { setupTest } from '@test-setup';
import { createAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

const folder = {
	absFolderPath: '/Test',
	id: '5',
	l: '1',
	name: 'Test',
	view: 'appointment'
};

const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

describe('EditorDailyPlannerController', () => {
	it('should render the enabled daily planner button', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				folders,
				dispatch: store.dispatch
			}
		});
		setupTest(<EditorDailyPlannerController editorId={editor.id} />, { store });
		const button = screen.getByRole('button', { name: /show organizer tool/ });
		expect(button).toBeEnabled();
	});

	it('should toggle the daily planner on button click', async () => {
		const freeBusyInterceptor = mockFreeBusyResponse([]);
		const workingHoursInterceptor = mockWorkingHoursResponse([]);

		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				folders,
				dispatch: store.dispatch
			}
		});
		const { user } = setupTest(<EditorDailyPlannerController editorId={editor.id} />, { store });
		const buttonShowOrganizer = screen.getByRole('button', { name: /show organizer tool/ });
		await user.click(buttonShowOrganizer);
		vi.advanceTimersByTime(250);
		await freeBusyInterceptor;
		await workingHoursInterceptor;
		const buttonHideOrganizer = screen.getByRole('button', { name: /hide organizer tool/ });
		expect(buttonHideOrganizer).toBeEnabled();
	});

	it('should not render the daily planner button if not within the same day', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const start = new Date(2021, 1, 1).getTime();
		const end = new Date(2021, 1, 3).getTime();
		const editor = generateEditor({
			context: {
				start,
				end,
				folders,
				dispatch: store.dispatch
			}
		});
		setupTest(<EditorDailyPlannerController editorId={editor.id} />, { store });
		const button = screen.queryByRole('button', { name: /show organizer tool/ });
		expect(button).not.toBeInTheDocument();
	});

	it('should not render the daily planner button if the event is recurrent', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				recur: { freq: 'daily' },
				folders,
				dispatch: store.dispatch
			}
		});

		setupTest(<EditorDailyPlannerController editorId={editor.id} />, { store });
		const button = screen.queryByRole('button', { name: /show organizer tool/ });
		expect(button).not.toBeInTheDocument();
	});

	it('should filter out duplicate attendees', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const freeBusyInterceptor = mockFreeBusyResponse([]);
		const workingHoursInterceptor = mockWorkingHoursResponse([]);

		const editor = generateEditor({
			context: {
				attendees: [{ email: 'test@test.com' }, { email: 'test@test.com' }],
				folders,
				dispatch: store.dispatch
			}
		});

		const { user } = setupTest(<EditorDailyPlannerController editorId={editor.id} />, { store });
		const buttonShowOrganizer = screen.getByRole('button', { name: /show organizer tool/ });
		await user.click(buttonShowOrganizer);
		vi.advanceTimersByTime(250);

		await freeBusyInterceptor;
		await workingHoursInterceptor;
		expect(screen.getAllByTestId('row-test@test.com').length).toBe(1);
	});

	it('should correctly handle same attendee both in optional and attendee fields', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const freeBusyInterceptor = mockFreeBusyResponse([]);
		const workingHoursInterceptor = mockWorkingHoursResponse([]);

		const editor = generateEditor({
			context: {
				attendees: [{ email: 'test@test.com' }],
				optionalAttendees: [{ email: 'test@test.com' }],
				folders,
				dispatch: store.dispatch
			}
		});

		const { user } = setupTest(<EditorDailyPlannerController editorId={editor.id} />, { store });
		const buttonShowOrganizer = screen.getByRole('button', { name: /show organizer tool/ });
		await user.click(buttonShowOrganizer);
		vi.advanceTimersByTime(250);

		await freeBusyInterceptor;
		await workingHoursInterceptor;
		expect(screen.getAllByTestId('row-test@test.com').length).toBe(2);
	});

	it('should not make duplicate api calls', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const workingHoursInterceptor = mockWorkingHoursResponse([]);
		const freeBusyInterceptor = createAPIInterceptor(
			'post',
			'/service/soap/GetFreeBusyRequest',
			HttpResponse.json({
				Body: {
					GetFreeBusyResponse: {
						usr: []
					}
				}
			})
		);

		const editor = generateEditor({
			context: {
				attendees: [{ email: 'test@test.com' }, { email: 'test@test.com' }],
				folders,
				dispatch: store.dispatch
			}
		});

		const { user } = setupTest(<EditorDailyPlannerController editorId={editor.id} />, { store });
		const buttonShowOrganizer = screen.getByRole('button', { name: /show organizer tool/ });
		await user.click(buttonShowOrganizer);
		vi.advanceTimersByTime(250);

		await workingHoursInterceptor;
		await waitFor(async () => {
			expect(screen.getByTestId('time-table')).toBeInTheDocument();
		});

		expect(freeBusyInterceptor.getCalledTimes()).toBe(1);
	});

	it('should pass current appointment uid to FreeBusy api call as element to exclude', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const workingHoursInterceptor = mockWorkingHoursResponse([]);
		const freeBusyInterceptor = mockFreeBusyResponse([]);
		const editor = generateEditor({
			context: {
				attendees: [{ email: 'test@test.com' }],
				folders,
				uid: '123',
				dispatch: store.dispatch
			}
		});

		const { user } = setupTest(<EditorDailyPlannerController editorId={editor.id} />, { store });
		const buttonShowOrganizer = screen.getByRole('button', { name: /show organizer tool/ });
		await user.click(buttonShowOrganizer);
		vi.advanceTimersByTime(250);

		const freeBusyRequest = await freeBusyInterceptor;

		await workingHoursInterceptor;

		expect(freeBusyRequest.excludeUid).toBe('123');
	});
});
