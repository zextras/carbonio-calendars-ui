/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { createCopy } from './appointment-actions-fn';
import * as shell from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import defaultSettings from '../carbonio-ui-commons/test/mocks/settings/default-settings';
import { PREFS_DEFAULTS } from '../constants';
import { reducers } from '../store/redux';
import mockedData from '../test/generators';
import * as editorUtils from '../utils/event';

shell.getUserSettings.mockImplementation(() => ({
	...defaultSettings,
	prefs: {
		...defaultSettings.prefs,
		zimbraPrefUseTimeZoneListInCalendar: 'TRUE',
		zimbraPrefCalendarDefaultApptDuration: '60m',
		zimbraPrefCalendarApptReminderWarningTime: '5',
		zimbraPrefDefaultCalendarId: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	}
}));

const editorId = 'new-1';
jest.spyOn(editorUtils, 'getNewId').mockReturnValue(editorId);

describe('actions', () => {
	describe('Copy', () => {
		test('on action will open an editor', async () => {
			const boardSpy = jest.spyOn(shell, 'addBoard');
			const folder = {
				absFolderPath: '/Test',
				id: '5',
				l: '1',
				name: 'Test',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });
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
			expect(boardSpy).toHaveBeenCalled();
		});
		test('If user copy the appointment from its default calendar, the calendar will be selected', async () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });
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
			const storeState = store.getState();
			const editor = storeState.editor.editors[editorId];
			expect(editor?.calendar?.id).toBe(PREFS_DEFAULTS.DEFAULT_CALENDAR_ID);
		});
		test('If user copy the appointment from any of its calendar, that calendar will be selected ', async () => {
			const folder = {
				absFolderPath: '/Test',
				id: '5',
				l: '1',
				name: 'Test',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });
			const onClose = jest.fn();

			const store = configureStore({
				reducer: combineReducers(reducers)
			});
			const event = mockedData.getEvent({
				resource: {
					calendar: {
						id: folder.id,
						name: folder.name,
						color: {
							color: 'red',
							background: 'green',
							label: 'red'
						}
					}
				}
			});

			const invite = mockedData.getInvite({ event });
			const context = {
				folders,
				dispatch: store.dispatch,
				onClose
			};
			const action = createCopy({ event, invite, context });
			action();
			const storeState = store.getState();
			const editor = storeState.editor.editors[editorId];
			expect(editor?.calendar?.id).toBe(folder.id);
		});
		test('If user copy the appointment from a shared calendar without write permission, the default calendar will be selected', async () => {
			const foldersArray = [
				{
					absFolderPath: '/Test',
					id: '5',
					l: '1',
					name: 'Test',
					owner: 'test@test.com',
					perm: 'r',
					view: 'appointment'
				},
				mockedData.calendars.defaultCalendar
			];

			const folders = mockedData.calendars.getCalendarsMap({ folders: foldersArray });
			const onClose = jest.fn();

			const store = configureStore({
				reducer: combineReducers(reducers)
			});
			const event = mockedData.getEvent({
				resource: {
					calendar: {
						id: foldersArray[0].id,
						name: foldersArray[0].name,
						owner: 'test@test.com',
						perm: 'r',
						color: {
							color: 'red',
							background: 'green',
							label: 'red'
						}
					}
				}
			});

			const invite = mockedData.getInvite({ event });
			const context = {
				folders,
				dispatch: store.dispatch,
				onClose
			};
			const action = createCopy({ event, invite, context });
			action();
			const storeState = store.getState();
			const editor = storeState.editor.editors[editorId];
			expect(editor?.calendar?.id).toBe(PREFS_DEFAULTS.DEFAULT_CALENDAR_ID);
		});
		test('If user copy the appointment from a shared calendar with write permission, that calendar will be selected', async () => {
			const foldersArray = [
				{
					absFolderPath: '/Test',
					id: '5',
					l: '1',
					name: 'Test',
					owner: 'test@test.com',
					perm: 'rwxida',
					view: 'appointment'
				},
				mockedData.calendars.defaultCalendar
			];

			const folders = mockedData.calendars.getCalendarsMap({ folders: foldersArray });
			const onClose = jest.fn();

			const store = configureStore({
				reducer: combineReducers(reducers)
			});
			const event = mockedData.getEvent({
				resource: {
					calendar: {
						id: foldersArray[0].id,
						name: foldersArray[0].name,
						owner: 'test@test.com',
						perm: foldersArray[0].perm,
						color: {
							color: 'red',
							background: 'green',
							label: 'red'
						}
					}
				}
			});

			const invite = mockedData.getInvite({ event });
			const context = {
				folders,
				dispatch: store.dispatch,
				onClose
			};
			const action = createCopy({ event, invite, context });
			action();
			const storeState = store.getState();
			const editor = storeState.editor.editors[editorId];
			expect(editor?.calendar?.id).toBe(foldersArray[0].id);
		});
	});
});
