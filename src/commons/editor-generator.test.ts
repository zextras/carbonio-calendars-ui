/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import moment from 'moment';
import * as shell from '../../__mocks__/@zextras/carbonio-shell-ui';
import {
	createFakeIdentity,
	getMockedAccountItem
} from '../carbonio-ui-commons/test/mocks/accounts/fakeAccounts';
import { PREFS_DEFAULTS } from '../constants';
import { getAlarmToString } from '../normalizations/normalizations-utils';
import { reducers } from '../store/redux';
import { EventResource, EventResourceCalendar, EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { disabledFields, EditorContext, generateEditor } from './editor-generator';
import { generateCalendarsArray } from '../test/generators/generators';

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

const folders = generateCalendarsArray({ folders: [folder] });

const getDefaultEvent = (): EventType => ({
	start: new Date(),
	end: new Date(),
	resource: {
		calendar: {
			id: '10',
			name: 'calendar',
			color: { color: '#000000', background: '#E6E9ED', label: 'black' }
		},
		organizer: {
			name: 'io',
			email: 'io@gmail.com'
		},
		alarm: true,
		alarmData: [
			{
				action: 'DISPLAY',
				trigger: [
					{
						rel: [
							{
								m: 5,
								neg: 'TRUE',
								related: 'START'
							}
						]
					}
				],
				desc: { description: '' }
			}
		],
		id: '1',
		inviteId: '1-2',
		name: 'name',
		hasException: false,
		ridZ: '1234',
		flags: '',
		dur: 123456789,
		iAmOrganizer: true,
		iAmVisitor: false,
		iAmAttendee: false,
		status: 'COMP',
		location: '',
		locationUrl: '',
		fragment: '',
		class: 'PUB',
		freeBusy: 'F',
		hasChangesNotNotified: false,
		inviteNeverSent: false,
		hasOtherAttendees: false,
		isRecurrent: false,
		isException: false,
		participationStatus: 'AC',
		compNum: 0,
		apptStart: 123456789,
		uid: '',
		tags: [''],
		neverSent: true
	},
	title: 'new-event-1',
	allDay: false,
	id: '1',
	permission: true,
	haveWriteAccess: true
});

const getDefaultInvite = (event?: GetEventProps): Invite => {
	const folderId = event?.resource?.calendar?.id ?? 'folderId';
	const alarmStringValue = event?.resource?.alarm || null;
	return {
		apptId: event?.resource?.id ?? 'apptId',
		id: event?.resource?.inviteId ?? 'id',
		ciFolder: folderId,
		attendees: [], // event doesn't have this
		parent: folderId,
		flags: event?.resource?.flags ?? '',
		parts: [], // event doesn't have this
		alarmValue: event?.resource?.alarmData?.[0]?.trigger?.[0]?.rel?.[0]?.m.toString(),
		alarmString: getAlarmToString(alarmStringValue) ?? 'never',
		class: event?.resource?.class ?? 'PUB',
		compNum: event?.resource?.compNum ?? 0,
		date: 1667382630000,
		textDescription: [], // event doesn't have this
		htmlDescription: [], // event doesn't have this
		end: {
			d: moment(event?.end).utc().format('YYYYMMDD[T]HHmmss[Z]'),
			u: event?.end?.valueOf() ?? 1667382630000
		},
		freeBusy: event?.resource?.freeBusy ?? 'F',
		freeBusyActualStatus: event?.resource?.freeBusy ?? 'F',
		fragment: event?.resource?.fragment ?? '',
		isOrganizer: event?.resource?.iAmOrganizer ?? true,
		location: event?.resource?.location ?? '',
		name: event?.resource?.name ?? '',
		noBlob: true,
		organizer: {
			a: event?.resource?.organizer?.email ?? 'asd',
			d: event?.resource?.organizer?.name ?? 'lol',
			url: event?.resource?.organizer?.email ?? 'url'
		},
		recurrenceRule: undefined,
		isRespRequested: false,
		start: {
			d: moment(event?.start).utc().format('YYYYMMDD[T]HHmmss[Z]'),
			u: event?.start?.valueOf() ?? 1667382630000
		},
		sequenceNumber: 123456789,
		status: event?.resource?.status ?? 'COMP',
		transparency: 'O',
		uid: event?.resource?.uid ?? '',
		url: '',
		isException: event?.resource?.isException ?? false,
		exceptId: event?.resource?.isException
			? [
					{
						d: 'string',
						tz: 'string',
						rangeType: 1
					}
			  ]
			: undefined,
		tagNamesList: '',
		tags: event?.resource?.tags ?? [],
		attach: {
			mp: []
		},
		attachmentFiles: [],
		participants: {
			AC: [
				{
					name: 'name',
					email: 'email',
					isOptional: false,
					response: 'AC'
				}
			]
		},
		alarm: event?.resource?.alarm ?? true,
		alarmData: event?.resource?.alarmData ?? [
			{
				nextAlarm: 123456789,
				alarmInstStart: 123456789,
				action: 'DISPLAY',
				desc: { description: '' },
				trigger: [
					{
						rel: [
							{
								m: 0,
								neg: 'TRUE',
								related: 'START'
							}
						]
					}
				]
			}
		],
		ms: 1,
		rev: 1,
		meta: [{}],
		allDay: event?.allDay ?? false,
		xprop: undefined,
		neverSent: event?.resource?.inviteNeverSent ?? true,
		locationUrl: event?.resource?.locationUrl ?? ''
	};
};

shell.useUserAccount.mockImplementation(() => userAccount);
shell.getUserAccount.mockImplementation(() => userAccount);

type CalendarProps = { calendar: Partial<EventResourceCalendar> };
type ResourceProps = {
	resource: Partial<Omit<Partial<EventResource>, 'calendar'> & CalendarProps>;
};
type GetEventProps = Omit<Partial<EventType>, 'resource'> & ResourceProps;

type GetInviteProps = { context?: Partial<Invite>; event?: GetEventProps };

const getEvent = (context = {} as GetEventProps): EventType => {
	const { calendar, organizer } = context?.resource ?? {};
	const baseEvent = getDefaultEvent();
	return {
		...baseEvent,
		...context,
		resource: {
			...baseEvent.resource,
			...context.resource,
			calendar: {
				...baseEvent.resource.calendar,
				...(calendar ?? {}),
				color: {
					...baseEvent.resource.calendar.color,
					...(calendar?.color ?? {})
				}
			},
			organizer: {
				...baseEvent.resource.organizer,
				...(organizer ?? {})
			}
		}
	};
};

const getInvite = (props?: GetInviteProps): Invite => {
	const baseInvite = getDefaultInvite(props?.event);
	return {
		...baseInvite,
		...(props?.context ?? {})
	};
};

shell.getUserSettings.mockImplementation(() => ({
	prefs: {
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
			const { editor, callbacks } = generateEditor({
				context
			});

			// expect editor and callbacks returned from function
			expect(editor).toBeDefined();
			expect(callbacks).toBeDefined();

			// expect all callbacks
			expect(callbacks).toHaveProperty('onToggleRichText');
			expect(callbacks).toHaveProperty('onAttachmentsChange');
			expect(callbacks).toHaveProperty('onOrganizerChange');
			expect(callbacks).toHaveProperty('onSubjectChange');
			expect(callbacks).toHaveProperty('onLocationChange');
			expect(callbacks).toHaveProperty('onRoomChange');
			expect(callbacks).toHaveProperty('onAttendeesChange');
			expect(callbacks).toHaveProperty('onOptionalAttendeesChange');
			expect(callbacks).toHaveProperty('onDisplayStatusChange');
			expect(callbacks).toHaveProperty('onCalendarChange');
			expect(callbacks).toHaveProperty('onPrivateChange');
			expect(callbacks).toHaveProperty('onDateChange');
			expect(callbacks).toHaveProperty('onTextChange');
			expect(callbacks).toHaveProperty('onAllDayChange');
			expect(callbacks).toHaveProperty('onTimeZoneChange');
			expect(callbacks).toHaveProperty('onReminderChange');
			expect(callbacks).toHaveProperty('onRecurrenceChange');
			expect(callbacks).toHaveProperty('onSave');
			expect(callbacks).toHaveProperty('onSend');

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
			const event = getEvent({
				resource: {
					isRecurrent: true,
					ridZ: undefined
				}
			});
			const invite = getInvite({ event });
			const context = { folders, dispatch: store.dispatch };
			const { editor } = generateEditor({ event, invite, context });

			expect(editor.isSeries).toBe(true);
			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(false);
			expect(editor.isNew).toBe(false);
		});
		test('single instance of a series', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const event = getEvent({
				resource: {
					isRecurrent: true
				}
			});
			const invite = getInvite({ event });
			const context = { folders, dispatch: store.dispatch };
			const { editor } = generateEditor({ event, invite, context });

			expect(editor.isSeries).toBe(true);
			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(true);
			expect(editor.isNew).toBe(false);
		});
		test('exception of a series', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const event = getEvent({
				resource: {
					isException: true
				}
			});
			const invite = getInvite({ event });
			const context = { folders, dispatch: store.dispatch };
			const { editor } = generateEditor({ event, invite, context });

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
					name: 'Room name',
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

			const { editor, callbacks } = generateEditor({ context });

			// expect editor and callbacks returned from function
			expect(editor).toBeDefined();
			expect(callbacks).toBeDefined();

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
			expect(editor.room).toHaveProperty('name', 'Room name');
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
});
