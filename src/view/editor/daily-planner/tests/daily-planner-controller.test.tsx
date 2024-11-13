/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';

import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../../commons/editor-generator';
import { mockFreeBusyResponse, mockWorkingHoursResponse } from '../../../../soap/tests/mocks';
import { reducers } from '../../../../store/redux';
import mockedData from '../../../../test/generators';
import { EditorDailyPlannerController } from '../daily-planner-controller';

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
		user.click(buttonShowOrganizer);
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

	it('should not render the daily planner button if not within the same day', () => {
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
});
