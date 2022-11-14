import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Folder } from '@zextras/carbonio-shell-ui';
import moment from 'moment';
import * as shell from '../../__mocks__/@zextras/carbonio-shell-ui';
import { PREFS_DEFAULTS } from '../constants';
import { reducers } from '../store/redux';
import { disabledFields, generateEditor } from './editor-generator';

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

/* const getRandomDate = () => {
	const maxDate = Date.now();
	const timestamp = Math.floor(Math.random() * maxDate);
	return new Date(timestamp);
};

const generateCalendarEvent = () => {
	const start = getRandomDate();
	const end = start.valueOf() + 3600 * 1000;
	return {
		start,
		end,
		// resource:,
		title: faker.name
		// id: faker.,
		// permission:,
		// haveWriteAccess:,
	};
}; */

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
		test.todo('series appointment');
		test.todo('single instance of a series');
		test.todo('exception of a series');
		test.todo('context in a single instance');
		test.todo('onProposeNewTime instead of onSave property of callbacks object');
	});
});
