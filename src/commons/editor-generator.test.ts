/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import moment from 'moment';

import { disabledFields, EditorContext, generateEditor } from './editor-generator';
import * as shell from '../../__mocks__/@zextras/carbonio-shell-ui';
import {
	createFakeIdentity,
	getMockedAccountItem
} from '../carbonio-ui-commons/test/mocks/accounts/fakeAccounts';
import defaultSettings from '../carbonio-ui-commons/test/mocks/settings/default-settings';
import { PREFS_DEFAULTS } from '../constants';
import { reducers } from '../store/redux';
import mockedData from '../test/generators';

const identity1 = createFakeIdentity();

const userAccount = getMockedAccountItem({ identity1 });

jest.setTimeout(50000);

const folder = {
	absFolderPath: '/Test',
	id: '5',
	l: '1',
	name: 'Test',
	view: 'appointment'
};

const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

shell.useUserAccount.mockImplementation(() => userAccount);
shell.getUserAccount.mockImplementation(() => userAccount);

shell.getUserSettings.mockImplementation(() => ({
	...defaultSettings,
	prefs: {
		...defaultSettings.prefs,
		zimbraPrefUseTimeZoneListInCalendar: 'TRUE',
		zimbraPrefTimeZoneId: 'Europe/Berlin',
		zimbraPrefCalendarDefaultApptDuration: '60m',
		zimbraPrefCalendarApptReminderWarningTime: '5',
		zimbraPrefDefaultCalendarId: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	}
}));

describe('Editor generator', () => {
	describe('From scratch', () => {
		test('standard single appointment', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const context = { folders, dispatch: store.dispatch };
			const editor = generateEditor({
				context
			});

			// expect editor returned from function
			expect(editor).toBeDefined();

			// expect default disabled fields to false
			expect(editor.disabled).toEqual(disabledFields);

			// expect a default calendar is selected
			expect(editor.calendar).toBeDefined();

			// expect organizer to be defined and to be the default
			expect(editor.organizer).toBeDefined();
			expect(editor.organizer.fullName).toBe(identity1.fullName);
			expect(editor.organizer.identityName).toBe('DEFAULT');

			// all parameters are the default ones
			expect(editor.allDay).toBe(false);
			expect(editor.attach).toBeUndefined();
			expect(editor.attachmentFiles).toStrictEqual([]);
			expect(editor.attendees).toStrictEqual([]);
			expect(editor.class).toBe('PUB');
			expect(editor.end).toBe(moment(editor.start).add('60', 'minutes').valueOf());
			expect(editor.exceptId).toBeUndefined();
			expect(editor.freeBusy).toBe('B');
			expect(editor.id).toBe('new-1');
			expect(editor.inviteId).toBeUndefined();
			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(true);
			expect(editor.isNew).toBe(true);
			expect(editor.isSeries).toBe(false);
			expect(editor.location).toBe('');
			expect(editor.optionalAttendees).toStrictEqual([]);
			expect(editor.panel).toBe(false);
			expect(editor.plainText).toBe('');
			expect(editor.recur).toBeUndefined();
			expect(editor.reminder).toBe('5');
			expect(editor.richText).toBe('');
			expect(editor.room).toBeUndefined();
			expect(editor.start).toBeLessThanOrEqual(new Date().valueOf());
			expect(editor.timezone).toBe('Europe/Berlin');
			expect(editor.title).toBe('');
		});
		test('series appointment', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const event = mockedData.getEvent({
				resource: {
					isRecurrent: true,
					ridZ: undefined
				}
			});
			const invite = mockedData.getInvite({ event });
			const context = { folders, dispatch: store.dispatch };
			const editor = generateEditor({ event, invite, context });

			expect(editor.isSeries).toBe(true);
			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(false);
			expect(editor.isNew).toBe(false);
		});
		test('single instance of a series', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const event = mockedData.getEvent({
				resource: {
					isRecurrent: true
				}
			});
			const invite = mockedData.getInvite({ event });
			const context = { folders, dispatch: store.dispatch };
			const editor = generateEditor({ event, invite, context });

			expect(editor.isSeries).toBe(true);
			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(true);
			expect(editor.isNew).toBe(false);
		});
		test('exception of a series', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const event = mockedData.getEvent({
				resource: {
					isException: true
				}
			});
			const invite = mockedData.getInvite({ event });
			const context = { folders, dispatch: store.dispatch };
			const editor = generateEditor({ event, invite, context });

			expect(editor.isSeries).toBe(false);
			expect(editor.isException).toBe(true);
			expect(editor.isInstance).toBe(true);
			expect(editor.isNew).toBe(false);
		});
		test('context in a single instance', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const context: EditorContext = {
				folders,
				dispatch: store.dispatch,
				disabled: disabledFields,
				isException: false,
				isInstance: true,
				isSeries: false,
				isNew: true,
				isRichText: false,
				plainText: 'test content',
				richText: '<p>test content</p>',
				attachmentFiles: [
					{
						contentType: 'image/gif',
						size: 9632179,
						name: '2',
						filename: 'filename_1.gif',
						disposition: 'attachment'
					}
				],
				organizer: {
					address: 'francesco.gottardi@zextras.com',
					fullName: 'Francesco Gottardi',
					identityName: 'DEFAULT',
					label: 'DEFAULT Francesco Gottardi (<francesco.gottardi@zextras.com>) ',
					type: undefined,
					value: '0'
				},
				title: 'Single istance',
				location: 'Location',
				room: {
					label: 'Room name',
					link: 'https://mail.zextras.com/meeting/meet-now/ZWFGRAOJ'
				},
				attendees: [],
				optionalAttendees: [],
				allDay: true,
				freeBusy: 'F',
				class: 'PRI',
				start: new Date().valueOf(),
				end: new Date().valueOf(),
				reminder: '10',
				recur: [
					{
						add: [
							{
								rule: [
									{
										freq: 'DAI',
										until: [
											{
												d: '20241119T110000Z'
											}
										],
										interval: [
											{
												ival: 1
											}
										]
									}
								]
							}
						]
					}
				],
				attach: {
					mp: [{ part: '2', mid: '3375-3374' }]
				}
			};

			const editor = generateEditor({ context });

			// expect editor and callbacks returned from function
			expect(editor).toBeDefined();

			// expect default disabled fields to false
			expect(editor.disabled).toEqual(disabledFields);

			// editor props check
			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(true);
			expect(editor.isNew).toBe(true);
			expect(editor.isSeries).toBe(false);
			expect(editor.isRichText).toBe(false);
			expect(editor.plainText).toBe('test content');
			expect(editor.richText).toBe('<p>test content</p>');
			expect(editor.organizer).toBeDefined();
			expect(editor.organizer).toHaveProperty(
				'label',
				'DEFAULT Francesco Gottardi (<francesco.gottardi@zextras.com>) '
			);
			expect(editor.title).toBe('Single istance');
			expect(editor.location).toBe('Location');
			expect(editor.room).toBeDefined();
			expect(editor.room).toHaveProperty('label', 'Room name');
			expect(editor.room).toHaveProperty(
				'link',
				'https://mail.zextras.com/meeting/meet-now/ZWFGRAOJ'
			);
			expect(editor.attendees).toStrictEqual([]);
			expect(editor.optionalAttendees).toStrictEqual([]);
			expect(editor.freeBusy).toBe('F');
			expect(editor.start).toBeLessThanOrEqual(new Date().valueOf());
			expect(editor.end).toBe(moment(editor.start).valueOf());
			expect(editor.allDay).toBe(true);
			expect(editor.reminder).toBe('10');
			expect(editor.recur[0].add[0].rule[0].freq).toBe('DAI');
			expect(editor.recur[0].add[0].rule[0].interval[0].ival).toBe(1);
			expect(editor.class).toBe('PRI');
			expect(editor.attach.mp[0].part).toBe('2');
			expect(editor.attach.mp[0].mid).toBe('3375-3374');
			expect(editor.attachmentFiles[0].contentType).toBe('image/gif');
			expect(editor.attachmentFiles[0].size).toBe(9632179);
			expect(editor.attachmentFiles[0].name).toBe('2');
			expect(editor.attachmentFiles[0].filename).toBe('filename_1.gif');
			expect(editor.attachmentFiles[0].disposition).toBe('attachment');
		});
	});
	describe('Edit event', () => {
		test('event without organizer has the calendar owner as default', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const event = mockedData.getEvent({
				resource: {
					organizer: undefined,
					calendar: folder
				}
			});
			const invite = mockedData.getInvite({ event });

			const context = { folders, dispatch: store.dispatch };
			const editor = generateEditor({
				context,
				invite,
				event
			});
			expect(editor.organizer.address).toBe(identity1.email);
			expect(editor.organizer.fullName).toBe(identity1.fullName);
		});
	});
});
