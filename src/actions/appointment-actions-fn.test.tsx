/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react';

import {
	acceptAsAction,
	createCopy,
	deletePermanently,
	editAppointment,
	emailAttendees,
	exportAppointmentICSFn,
	moveAppointment,
	moveToTrash,
	openAppointment,
	proposeNewTimeFn
} from './appointment-actions-fn';
import { PANEL_VIEW, PREFS_DEFAULTS } from '../constants';
import { PARTICIPANT_ROLE, ParticipantRoleType, PARTICIPATION_STATUS } from '../constants/api';
import { reducers } from '../store/redux';
import mockedData from '../test/generators';
import { EventType } from '../types/event';
import { Attendee, Invite } from '../types/store/invite';
import * as editorUtils from '../utils/event';
import * as shell from '@test-mocks/@zextras/carbonio-shell-ui';
import defaultSettings from '@test-utils/settings/default-settings';
import { InviteReplyVerb } from 'soap/send-invite-reply-request';

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
beforeEach(() => {
	vi.spyOn(editorUtils, 'getNewId').mockReturnValue(editorId);
});

const keyboardEvent = new KeyboardEvent('keydown', {
	key: 'Enter',
	code: 'Enter',
	bubbles: true
});

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

	describe('Edit', () => {
		test('on action will open an editor', async () => {
			const boardSpy = vi.spyOn(shell, 'addBoard');
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

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
				onClose: vi.fn()
			};

			const action = editAppointment({ event, invite, context });
			action();
			expect(boardSpy).toHaveBeenCalled();
		});

		test('empty invite is fetched before opening editor', async () => {
			const boardSpy = vi.spyOn(shell, 'addBoard');
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const event = mockedData.getEvent();
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: vi.fn()
			};

			const action = editAppointment({ event, context });
			action();
			await waitFor(() => {
				expect(boardSpy).toHaveBeenCalled();
			});
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

	describe('moveToTrash', () => {
		test('on action will create a modal', () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const createModalMock = vi.fn();
			const closeModalMock = vi.fn();
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: vi.fn(),
				createModal: createModalMock,
				closeModal: closeModalMock,
				createSnackbar: vi.fn(),
				createAndApplyTag: vi.fn(),
				tags: []
			};

			const action = moveToTrash({ event, invite, context });
			action();
			expect(createModalMock).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'move-to-trash'
				}),
				true
			);
		});

		test('calls onClose when action is triggered', async () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const onCloseMock = vi.fn();
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: onCloseMock,
				createModal: vi.fn(),
				closeModal: vi.fn(),
				createSnackbar: vi.fn(),
				createAndApplyTag: vi.fn(),
				tags: []
			};

			const action = moveToTrash({ event, invite, context });
			action();
			expect(onCloseMock).toHaveBeenCalled();
		});

		test('null invite is fetched remotely before creating modal', async () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const event = mockedData.getEvent();
			const createModalMock = vi.fn();
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: vi.fn(),
				createModal: createModalMock,
				closeModal: vi.fn(),
				createSnackbar: vi.fn(),
				createAndApplyTag: vi.fn(),
				tags: []
			};

			const action = moveToTrash({ event, context });
			action();
			await waitFor(() => {
				expect(createModalMock).toHaveBeenCalledWith(
					expect.objectContaining({
						id: 'move-to-trash'
					}),
					true
				);
			});
		});
	});

	describe('moveAppointment', () => {
		test('on action will create a modal', () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const event = mockedData.getEvent();
			const createModalMock = vi.fn();
			const closeModalMock = vi.fn();
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: vi.fn(),
				createModal: createModalMock,
				closeModal: closeModalMock,
				createSnackbar: vi.fn(),
				createAndApplyTag: vi.fn(),
				tags: []
			};

			const action = moveAppointment({ event, context });
			action(keyboardEvent);
			expect(createModalMock).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'move-appointment'
				}),
				true
			);
		});

		test('calls onClose when action is triggered', () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const event = mockedData.getEvent();
			const onCloseMock = vi.fn();
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: onCloseMock,
				createModal: vi.fn(),
				closeModal: vi.fn(),
				createSnackbar: vi.fn(),
				createAndApplyTag: vi.fn(),
				tags: []
			};

			const action = moveAppointment({ event, context });
			action(keyboardEvent);
			expect(onCloseMock).toHaveBeenCalled();
		});
	});

	describe('deletePermanently', () => {
		test('on action will create a modal', () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const event = mockedData.getEvent();
			const createModalMock = vi.fn();
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: vi.fn(),
				createModal: createModalMock,
				closeModal: vi.fn(),
				createSnackbar: vi.fn(),
				createAndApplyTag: vi.fn(),
				tags: []
			};

			const action = deletePermanently({ event, context });
			action(keyboardEvent);
			expect(createModalMock).toHaveBeenCalledWith(
				expect.objectContaining({
					id: 'delete-permanently'
				}),
				true
			);
		});
	});

	describe('openAppointment', () => {
		test('navigates correctly in APP panel view without ridZ', () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const event = mockedData.getEvent({
				resource: {
					ridZ: undefined
				}
			});
			const replaceHistoryMock = vi.fn();
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: replaceHistoryMock,
				onClose: vi.fn(),
				panelView: PANEL_VIEW.APP,
				createModal: vi.fn(),
				closeModal: vi.fn(),
				createSnackbar: vi.fn(),
				createAndApplyTag: vi.fn(),
				tags: []
			};

			const action = openAppointment({ event, context });
			action();
			expect(replaceHistoryMock).toHaveBeenCalledWith(
				`/calendars/${event.resource.calendar.id}/expand/${event.resource.id}`
			);
		});

		test('navigates correctly in APP panel view with ridZ', () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const event = mockedData.getEvent({
				resource: {
					ridZ: '20240101T100000'
				}
			});
			const replaceHistoryMock = vi.fn();
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: replaceHistoryMock,
				onClose: vi.fn(),
				panelView: PANEL_VIEW.APP,
				createSnackbar: vi.fn(),
				createAndApplyTag: vi.fn(),
				tags: [],
				createModal: vi.fn(),
				closeModal: vi.fn()
			};

			const action = openAppointment({ event, context });
			action();
			expect(replaceHistoryMock).toHaveBeenCalledWith(
				`/calendars/${event.resource.calendar.id}/expand/${event.resource.id}/${event.resource.ridZ}`
			);
		});

		test('navigates correctly in SEARCH panel view without ridZ', () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const event = mockedData.getEvent({
				resource: {
					ridZ: undefined
				}
			});
			const replaceHistoryMock = vi.fn();
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: replaceHistoryMock,
				onClose: vi.fn(),
				closeModal: vi.fn(),
				createModal: vi.fn(),
				panelView: PANEL_VIEW.SEARCH,
				createSnackbar: vi.fn(),
				createAndApplyTag: vi.fn(),
				tags: []
			};

			const action = openAppointment({ event, context });
			action();
			expect(replaceHistoryMock).toHaveBeenCalledWith(`../calendars/expand/${event.resource.id}`);
		});

		test('navigates correctly in SEARCH panel view with ridZ', () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const event = mockedData.getEvent({
				resource: {
					ridZ: '20240101T100000'
				}
			});
			const replaceHistoryMock = vi.fn();
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: replaceHistoryMock,
				onClose: vi.fn(),
				closeModal: vi.fn(),
				createModal: vi.fn(),
				panelView: PANEL_VIEW.SEARCH,
				createSnackbar: vi.fn(),
				createAndApplyTag: vi.fn(),
				tags: []
			};

			const action = openAppointment({ event, context });
			action();
			expect(replaceHistoryMock).toHaveBeenCalledWith(
				`../expand/${event.resource.id}/${event.resource.ridZ}`
			);
		});

		test('calls onClose when action is triggered', () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const event = mockedData.getEvent();
			const onCloseMock = vi.fn();
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				closeModal: vi.fn(),
				createModal: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: onCloseMock,
				panelView: PANEL_VIEW.APP,
				createSnackbar: vi.fn(),
				createAndApplyTag: vi.fn(),
				tags: []
			};

			const action = openAppointment({ event, context });
			action();
			expect(onCloseMock).toHaveBeenCalled();
		});
	});

	describe('acceptAsAction', () => {
		test('dispatches sendInviteResponse with correct parameters for ACCEPT', async () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const dispatchSpy = vi.spyOn(store, 'dispatch');
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: vi.fn(),
				panelView: PANEL_VIEW.APP,
				createSnackbar: vi.fn(),
				createAndApplyTag: vi.fn(),
				tags: []
			};

			const action = acceptAsAction({
				actionType: 'ACCEPT' as unknown as InviteReplyVerb,
				event,
				invite,
				context
			});
			action();
			await waitFor(() => {
				expect(dispatchSpy).toHaveBeenCalled();
			});
		});

		test('dispatches sendInviteResponse with exceptId for recurrent instance', () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const dispatchSpy = vi.spyOn(store, 'dispatch');
			const event = mockedData.getEvent({
				resource: {
					isRecurrent: true
				}
			});
			const invite = mockedData.getInvite({ event });
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: vi.fn(),
				isInstance: true
			};

			const action = acceptAsAction({
				actionType: 'TENTATIVE' as unknown as InviteReplyVerb,
				event,
				invite,
				context
			});
			action();
			expect(dispatchSpy).toHaveBeenCalled();
		});

		test('dispatches sendInviteResponse for DECLINE action', async () => {
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const dispatchSpy = vi.spyOn(store, 'dispatch');
			const event = mockedData.getEvent();
			const invite = mockedData.getInvite({ event });
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: vi.fn()
			};

			const action = acceptAsAction({
				actionType: 'DECLINE' as unknown as InviteReplyVerb,
				event,
				invite,
				context
			});
			action();
			await waitFor(() => {
				expect(dispatchSpy).toHaveBeenCalled();
			});
		});
	});

	describe('proposeNewTimeFn', () => {
		test('on action will open an editor with propose new time context', () => {
			const boardSpy = vi.spyOn(shell, 'addBoard');
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

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
				onClose: vi.fn()
			};

			const action = proposeNewTimeFn({ event, invite, context });
			action();
			expect(boardSpy).toHaveBeenCalled();
		});

		test('null invite is fetched before opening editor', async () => {
			const boardSpy = vi.spyOn(shell, 'addBoard');
			const folder = {
				absFolderPath: '/Calendar',
				id: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID,
				l: '1',
				name: 'Calendar',
				view: 'appointment'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			const event = mockedData.getEvent();
			const context = {
				folders,
				dispatch: store.dispatch,
				t: vi.fn(),
				replaceHistory: vi.fn(),
				onClose: vi.fn()
			};

			const action = proposeNewTimeFn({ event, context });
			action();
			await waitFor(() => {
				expect(boardSpy).toHaveBeenCalled();
			});
		});
	});

	describe('exportAppointmentICSFn', () => {
		test('creates download link with correct attributes', () => {
			const event = mockedData.getEvent({
				title: 'Test Meeting'
			});

			const createElementSpy = vi.spyOn(document, 'createElement');
			const appendChildSpy = vi.spyOn(document.body, 'appendChild');
			const removeChildSpy = vi.spyOn(document.body, 'removeChild');

			const action = exportAppointmentICSFn({ event });
			action();

			expect(createElementSpy).toHaveBeenCalledWith('a');
			expect(appendChildSpy).toHaveBeenCalled();
			expect(removeChildSpy).toHaveBeenCalled();
		});
	});
});
