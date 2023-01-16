/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import React from 'react';
import * as shell from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { PREFS_DEFAULTS } from '../constants';
import { reducers } from '../store/redux';
import mockedData from '../test/generators';
import { createCopy } from './appointment-actions-fn';

shell.getUserSettings.mockImplementation(() => ({
	prefs: {
		zimbraPrefUseTimeZoneListInCalendar: 'TRUE',
		zimbraPrefTimeZoneId: 'Europe/Berlin',
		zimbraPrefCalendarDefaultApptDuration: '60m',
		zimbraPrefCalendarApptReminderWarningTime: '5',
		zimbraPrefDefaultCalendarId: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	}
}));

describe('actions', () => {
	test('create a copy', async () => {
		const boardSpy = jest.spyOn(shell, 'addBoard');
		const folder = {
			absFolderPath: '/Test',
			id: '5',
			l: '1',
			name: 'Test',
			view: 'appointment'
		};

		const folders = mockedData.calendars.getCalendarsArray({ folders: [folder] });
		const onClose = jest.fn();

		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		const event = mockedData.getEvent();

		const invite = mockedData.getInvite({ event });
		const context = {
			folders,
			dispatch: store.dispatch,
			onClose
		};
		const action = createCopy({ event, invite, context });
		action();
		const { activeId } = store.getState().editor;
		const editor = store.getState().editor.editors[activeId as string];
		expect(activeId).toBeDefined();
		expect(editor).toBeDefined();
		expect(boardSpy).toHaveBeenCalled();
	});
});
