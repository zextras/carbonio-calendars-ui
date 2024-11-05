/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { setupTest, screen } from '../../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../../commons/editor-generator';
import { reducers } from '../../../../store/redux';
import mockedData from '../../../../test/generators';
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
		const context = { folders, dispatch: store.dispatch };
		const editor = generateEditor({
			context
		});

		setupTest(<EditorDailyPlanner editorId={editor.id} />, { store });
		expect(screen.getByTestId(`daily-planner-component-${editor.id}`)).toBeInTheDocument();
		expect(screen.getByText(editor.organizer.fullName)).toBeVisible();
	});
});
