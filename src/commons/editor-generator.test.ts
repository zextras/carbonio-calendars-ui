import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Folder } from '@zextras/carbonio-shell-ui';
import moment from 'moment';
import * as shell from '../../__mocks__/@zextras/carbonio-shell-ui';
import { PREFS_DEFAULTS } from '../constants';
import { getAlarmToString } from '../normalizations/normalizations-utils';
import { reducers } from '../store/redux';
import { EventResource, EventResourceCalendar, EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { disabledFields, generateEditor } from './editor-generator';

// todo: datePicker render is very slow
jest.setTimeout(20000);

const folders: Array<Folder> = [
	{
		absFolderPath: '/Calendar',
		acl: undefined,
		activesyncdisabled: false,
		children: [],
		color: undefined,
		deletable: false,
		depth: 1,
		f: '#',
		i4ms: 6046,
		i4n: undefined,
		i4next: 396,
		i4u: undefined,
		id: '10',
		isLink: false,
		l: '1',
		luuid: 'b9483716-91e9-4ecf-a594-344185f17ac9',
		md: undefined,
		meta: undefined,
		ms: 1,
		n: 4,
		name: 'Calendar',
		perm: undefined,
		recursive: false,
		rest: undefined,
		retentionPolicy: undefined,
		rev: 1,
		rgb: undefined,
		s: 0,
		u: undefined,
		url: undefined,
		uuid: '365f04ec-2c8d-4ef0-9998-a23e94a85725',
		view: 'appointment',
		webOfflineSyncDays: 0
	}
];

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
			expect(editor.organizer).toHaveProperty('label', 'DEFAULT');

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
		test.todo('exception of a series');
		test.todo('context in a single instance');
		test.todo('onProposeNewTime instead of onSave property of callbacks object');
	});
});
