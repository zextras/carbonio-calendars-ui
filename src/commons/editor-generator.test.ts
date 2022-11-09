import * as shell from '../../__mocks__/@zextras/carbonio-shell-ui';
import { PREFS_DEFAULTS } from '../constants';
import { generateEditor } from './editor-generator';

const folders = [
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
			const context = { folders };
			const { editor, callbacks } = generateEditor({
				context
			});

			expect(editor).toBeDefined();
			expect(callbacks).toBeDefined();
			expect(editor.calendar).toBeDefined();

			expect(editor.title).toBe('');
			expect(editor.location).toBe('');
			expect(editor.freeBusy).toBe('B');
			expect(editor.class).toBe('PUB');
			expect(editor.timezone).toBe('Europe/Berlin');
			expect(editor.reminder).toBe('5');
			expect(editor.richText).toBe('');
			expect(editor.plainText).toBe('');
			expect(editor.panel).toBe(false);
			expect(editor.isInstance).toBe(true);
			expect(editor.isSeries).toBe(false);
			expect(editor.isException).toBe(false);
		});
	});
});
