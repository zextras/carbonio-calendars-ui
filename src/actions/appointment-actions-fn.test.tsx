/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react';

import { createCopy, emailAttendees } from './appointment-actions-fn';
import { PREFS_DEFAULTS } from '../constants';
import { PARTICIPANT_ROLE, ParticipantRoleType, PARTICIPATION_STATUS } from '../constants/api';
import { reducers } from '../store/redux';
import mockedData from '../test/generators';
import { EventType } from '../types/event';
import { Attendee, Invite } from '../types/store/invite';
import * as editorUtils from '../utils/event';
import * as shell from '@test-utils/carbonio-shell-ui/carbonio-shell-ui';
import defaultSettings from '@test-utils/settings/default-settings';

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
vi.spyOn(editorUtils, 'getNewId').mockReturnValue(editorId);

describe('actions', () => {
	describe('Copy', () => {
		test('on action will open an editor', async () => {
			const boardSpy = vi.spyOn(shell, 'addBoard');
			const folder = {
				absFolderPath: '/Test',
				id: '5',
				l: '1',
				name: 'Test',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });
			const onClose = vi.fn();

			const store = configureStore({
				reducer: combineReducers(reducers)
			});
			const event = mockedData.getEvent();

			const invite = mockedData.getInvite({ event });
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
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
			const onClose = vi.fn();

			const store = configureStore({
				reducer: combineReducers(reducers)
			});
			const event = mockedData.getEvent();

			const invite = mockedData.getInvite({ event });
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
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
			const onClose = vi.fn();

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
				t: vi.fn(),
				replaceHistory: vi.fn(),
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
			const onClose = vi.fn();

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
				t: vi.fn(),
				replaceHistory: vi.fn(),
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
			const onClose = vi.fn();

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
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose
			};
			const action = createCopy({ event, invite, context });
			action();
			const storeState = store.getState();
			const editor = storeState.editor.editors[editorId];
			expect(editor?.calendar?.id).toBe(foldersArray[0].id);
		});
	});

	describe('emailAttendees', () => {
		const ORGANIZER: EventType['resource']['organizer'] = {
			email: 'organizer@zextras.com',
			name: 'Organizer'
		};

		function createAttendee(email: string, name: string, role: ParticipantRoleType): Attendee {
			return {
				a: email,
				d: name,
				cutype: '',
				ptst: PARTICIPATION_STATUS.ACCEPTED,
				role,
				rsvp: false,
				url: ''
			};
		}

		test('email sent to all attendees and organizer', async () => {
			const getActionSpy = vi.spyOn(shell, 'getAction');

			const store = configureStore({
				reducer: combineReducers(reducers)
			});
			const event = {
				...mockedData.getEvent(),
				resource: {
					...mockedData.getEvent().resource,
					organizer: ORGANIZER
				}
			};

			const invite: Invite = {
				...mockedData.getInvite({ event }),
				attendees: [
					createAttendee('attendee1@zextras.com', 'Attendee 1', PARTICIPANT_ROLE.REQUIRED)
				]
			};
			const context = {
				folders: {},
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: vi.fn()
			};
			emailAttendees({ event, invite, context });
			expect(getActionSpy).toHaveBeenCalledWith('recipients', 'mail-to', {
				recipients: expect.arrayContaining([
					{
						carbonCopy: false,
						...ORGANIZER
					},
					{ carbonCopy: false, email: 'attendee1@zextras.com', name: 'Attendee 1' }
				]),
				subject: event.title
			});
		});

		test('exclude yourself from recipients', async () => {
			const mySelf = shell.mockedAccount;
			const getActionSpy = vi.spyOn(shell, 'getAction');

			const store = configureStore({
				reducer: combineReducers(reducers)
			});
			const event = {
				...mockedData.getEvent(),
				resource: {
					...mockedData.getEvent().resource,
					organizer: ORGANIZER
				}
			};

			const invite: Invite = {
				...mockedData.getInvite({ event }),
				attendees: [createAttendee(mySelf.name, 'Attendee 1', PARTICIPANT_ROLE.REQUIRED)]
			};
			const context = {
				folders: {},
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: vi.fn()
			};
			emailAttendees({ event, invite, context });
			expect(getActionSpy).toHaveBeenCalledWith('recipients', 'mail-to', {
				recipients: expect.not.arrayContaining([
					{ carbonCopy: false, email: mySelf.name, name: 'Attendee 1' }
				]),
				subject: event.title
			});
		});

		test('cc optional attendees', async () => {
			const getActionSpy = vi.spyOn(shell, 'getAction');

			const store = configureStore({
				reducer: combineReducers(reducers)
			});
			const event = {
				...mockedData.getEvent(),
				resource: {
					...mockedData.getEvent().resource,
					organizer: ORGANIZER
				}
			};

			const invite: Invite = {
				...mockedData.getInvite({ event }),
				attendees: [
					createAttendee('attendee1@zextras.com', 'Attendee 1', PARTICIPANT_ROLE.OPTIONAL)
				]
			};
			const context = {
				folders: {},
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: vi.fn()
			};
			emailAttendees({ event, invite, context });
			expect(getActionSpy).toHaveBeenCalledWith('recipients', 'mail-to', {
				recipients: expect.arrayContaining([
					{
						carbonCopy: false,
						...ORGANIZER
					},
					{ carbonCopy: true, email: 'attendee1@zextras.com', name: 'Attendee 1' }
				]),
				subject: event.title
			});
		});

		test('null invite is fetched remotely', async () => {
			const getActionSpy = vi.spyOn(shell, 'getAction');

			const store = configureStore({
				reducer: combineReducers(reducers)
			});
			const event = {
				...mockedData.getEvent(),
				resource: {
					...mockedData.getEvent().resource,
					organizer: ORGANIZER
				}
			};

			const context = {
				folders: {},
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: vi.fn()
			};
			emailAttendees({ event, context });
			await waitFor(() => {
				expect(getActionSpy).toHaveBeenCalledWith('recipients', 'mail-to', {
					recipients: expect.arrayContaining([
						{
							carbonCopy: false,
							...ORGANIZER
						}
					]),
					subject: event.title
				});
			});
		});
	});
});
