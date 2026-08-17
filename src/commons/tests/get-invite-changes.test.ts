/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { formatCompactDateTimeRange, getInviteChanges } from '../get-invite-changes';
import { Editor } from '../../types/editor';

const dateTimeLabel = (start: number, end: number, allDay = false): string =>
	formatCompactDateTimeRange(start, end, allDay);

const buildEditor = (overrides: Partial<Editor> = {}): Editor =>
	({
		id: 'editor-id',
		plainText: 'hello',
		start: 1000,
		end: 2000,
		attendees: [],
		optionalAttendees: [],
		...overrides
	}) as unknown as Editor;

describe('getInviteChanges', () => {
	it('returns undefined when there is no original editor', () => {
		expect(getInviteChanges(undefined, buildEditor())).toBeUndefined();
	});

	it('returns undefined when nothing changed', () => {
		const original = buildEditor();
		const current = buildEditor();
		expect(getInviteChanges(original, current)).toBeUndefined();
	});

	it('detects a message change', () => {
		const original = buildEditor({ plainText: 'before' });
		const current = buildEditor({ plainText: 'after' });
		expect(getInviteChanges(original, current)).toEqual({
			message: { before: 'before', after: 'after' }
		});
	});

	it('treats whitespace-only differences as no change', () => {
		const original = buildEditor({ plainText: '  same text  ' });
		const current = buildEditor({ plainText: 'same text' });
		expect(getInviteChanges(original, current)).toBeUndefined();
	});

	it('detects a title change', () => {
		const original = buildEditor({ title: 'Old title' });
		const current = buildEditor({ title: 'New title' });
		expect(getInviteChanges(original, current)).toEqual({
			title: { before: 'Old title', after: 'New title' }
		});
	});

	it('treats a missing title as an empty string on both sides', () => {
		const original = buildEditor({ title: undefined });
		const current = buildEditor({ title: undefined });
		expect(getInviteChanges(original, current)).toBeUndefined();
	});

	it('detects a location change', () => {
		const original = buildEditor({ location: 'Room A' });
		const current = buildEditor({ location: 'Room B' });
		expect(getInviteChanges(original, current)).toEqual({
			location: { before: 'Room A', after: 'Room B' }
		});
	});

	it('detects an added meeting room and an added equipment item as separate fields', () => {
		const original = buildEditor({ meetingRoom: [], equipment: [] });
		const current = buildEditor({
			meetingRoom: [{ email: 'room@test.com', label: 'Room A' }],
			equipment: [{ email: 'projector@test.com', label: 'Projector' }]
		});
		expect(getInviteChanges(original, current)).toEqual({
			meetingRooms: { added: [{ a: 'room@test.com', d: 'Room A' }], removed: [] },
			equipment: { added: [{ a: 'projector@test.com', d: 'Projector' }], removed: [] }
		});
	});

	it('detects a removed meeting room', () => {
		const original = buildEditor({ meetingRoom: [{ email: 'room@test.com', label: 'Room A' }] });
		const current = buildEditor({ meetingRoom: [] });
		expect(getInviteChanges(original, current)).toEqual({
			meetingRooms: { added: [], removed: [{ a: 'room@test.com', d: 'Room A' }] }
		});
	});

	it('detects a removed equipment item', () => {
		const original = buildEditor({
			equipment: [{ email: 'projector@test.com', label: 'Projector' }]
		});
		const current = buildEditor({ equipment: [] });
		expect(getInviteChanges(original, current)).toEqual({
			equipment: { added: [], removed: [{ a: 'projector@test.com', d: 'Projector' }] }
		});
	});

	it('ignores meeting rooms/equipment without an email', () => {
		const original = buildEditor({ meetingRoom: [], equipment: [] });
		const current = buildEditor({
			meetingRoom: [{ email: '', label: 'Deleted Room' }] as never,
			equipment: [{ email: '', label: 'Deleted Equipment' }] as never
		});
		expect(getInviteChanges(original, current)).toBeUndefined();
	});

	it('detects a virtual room link change', () => {
		const original = buildEditor({ room: { label: 'Old Room', link: 'https://old.example.com' } });
		const current = buildEditor({ room: { label: 'New Room', link: 'https://new.example.com' } });
		expect(getInviteChanges(original, current)).toEqual({
			virtualRoom: { before: 'https://old.example.com', after: 'https://new.example.com' }
		});
	});

	it('detects a virtual room being removed entirely', () => {
		const original = buildEditor({ room: { label: 'Room', link: 'https://example.com' } });
		const current = buildEditor({ room: undefined });
		expect(getInviteChanges(original, current)).toEqual({
			virtualRoom: { before: 'https://example.com', after: '' }
		});
	});

	it('detects a pure all-day toggle as a date/time change, since start/end alone stay untouched', () => {
		const original = buildEditor({ allDay: false });
		const current = buildEditor({ allDay: true });
		expect(getInviteChanges(original, current)).toEqual({
			dateTime: {
				before: dateTimeLabel(1000, 2000, false),
				after: dateTimeLabel(1000, 2000, true),
				beforeAllDay: false,
				afterAllDay: true
			}
		});
	});

	it('treats a missing allDay as false on both sides', () => {
		const original = buildEditor({ allDay: undefined });
		const current = buildEditor({ allDay: undefined });
		expect(getInviteChanges(original, current)).toBeUndefined();
	});

	it('detects a date/time change', () => {
		const original = buildEditor({ start: 1000, end: 2000 });
		const current = buildEditor({ start: 1500, end: 2500 });
		expect(getInviteChanges(original, current)).toEqual({
			dateTime: {
				before: dateTimeLabel(1000, 2000),
				after: dateTimeLabel(1500, 2500),
				beforeAllDay: false,
				afterAllDay: false
			}
		});
	});

	it('detects only the end time changing', () => {
		const original = buildEditor({ start: 1000, end: 2000 });
		const current = buildEditor({ start: 1000, end: 2500 });
		expect(getInviteChanges(original, current)).toEqual({
			dateTime: {
				before: dateTimeLabel(1000, 2000),
				after: dateTimeLabel(1000, 2500),
				beforeAllDay: false,
				afterAllDay: false
			}
		});
	});

	it('detects an added participant', () => {
		const original = buildEditor({ attendees: [] });
		const current = buildEditor({
			attendees: [{ email: 'new@test.com', fullName: 'New Person' }]
		});
		expect(getInviteChanges(original, current)).toEqual({
			participants: {
				added: [{ a: 'new@test.com', d: 'New Person' }],
				removed: []
			}
		});
	});

	it('detects a removed participant', () => {
		const original = buildEditor({
			attendees: [{ email: 'old@test.com', fullName: 'Old Person' }]
		});
		const current = buildEditor({ attendees: [] });
		expect(getInviteChanges(original, current)).toEqual({
			participants: {
				added: [],
				removed: [{ a: 'old@test.com', d: 'Old Person' }]
			}
		});
	});

	it('omits the time of day once the event becomes all day', () => {
		const original = buildEditor({ start: 1000, end: 2000, allDay: false });
		const current = buildEditor({ start: 1000 + 86400000, end: 2000 + 86400000, allDay: true });
		const changes = getInviteChanges(original, current);
		expect(changes?.dateTime).toEqual({
			before: dateTimeLabel(1000, 2000, false),
			after: dateTimeLabel(1000 + 86400000, 2000 + 86400000, true),
			beforeAllDay: false,
			afterAllDay: true
		});
		expect(changes?.dateTime?.after).not.toMatch(/\d{1,2}:\d{2}/);
	});

	it('detects added and removed participants together, including optional attendees', () => {
		const original = buildEditor({
			attendees: [{ email: 'stays@test.com', fullName: 'Stays' }],
			optionalAttendees: [{ email: 'removed@test.com', fullName: 'Removed' }]
		});
		const current = buildEditor({
			attendees: [{ email: 'stays@test.com', fullName: 'Stays' }],
			optionalAttendees: [{ email: 'added@test.com', fullName: 'Added' }]
		});
		expect(getInviteChanges(original, current)).toEqual({
			participants: {
				added: [{ a: 'added@test.com', d: 'Added' }],
				removed: [{ a: 'removed@test.com', d: 'Removed' }]
			}
		});
	});

	it('treats emails as case-insensitive when diffing participants', () => {
		const original = buildEditor({
			attendees: [{ email: 'Same@Test.com', fullName: 'Same' }]
		});
		const current = buildEditor({
			attendees: [{ email: 'same@test.com', fullName: 'Same' }]
		});
		expect(getInviteChanges(original, current)).toBeUndefined();
	});

	it('derives a display name from firstName/lastName when fullName is missing', () => {
		const original = buildEditor({ attendees: [] });
		const current = buildEditor({
			attendees: [{ email: 'new@test.com', firstName: 'New', lastName: 'Person' }]
		});
		expect(getInviteChanges(original, current)).toEqual({
			participants: {
				added: [{ a: 'new@test.com', d: 'New Person' }],
				removed: []
			}
		});
	});

	it('combines message, date/time, and participant changes together', () => {
		const original = buildEditor({
			plainText: 'before',
			start: 1000,
			end: 2000,
			attendees: [{ email: 'old@test.com', fullName: 'Old' }]
		});
		const current = buildEditor({
			plainText: 'after',
			start: 1500,
			end: 2500,
			attendees: [{ email: 'new@test.com', fullName: 'New' }]
		});
		expect(getInviteChanges(original, current)).toEqual({
			message: { before: 'before', after: 'after' },
			dateTime: {
				before: dateTimeLabel(1000, 2000),
				after: dateTimeLabel(1500, 2500),
				beforeAllDay: false,
				afterAllDay: false
			},
			participants: {
				added: [{ a: 'new@test.com', d: 'New' }],
				removed: [{ a: 'old@test.com', d: 'Old' }]
			}
		});
	});
});

describe('formatCompactDateTimeRange', () => {
	it('shows AM/PM only once when start and end share the same period on the same day', () => {
		const start = new Date(2026, 6, 29, 20, 30).getTime();
		const end = new Date(2026, 6, 29, 21, 0).getTime();
		expect(formatCompactDateTimeRange(start, end, false)).toBe('Wed, Jul 29, 8:30 – 9:00 PM');
	});

	it('shows AM/PM on both sides when start and end fall in different periods on the same day', () => {
		const start = new Date(2026, 6, 29, 11, 30).getTime();
		const end = new Date(2026, 6, 29, 13, 30).getTime();
		expect(formatCompactDateTimeRange(start, end, false)).toBe('Wed, Jul 29, 11:30 AM – 1:30 PM');
	});

	it('shows the full date and AM/PM on both sides when start and end are on different days', () => {
		const start = new Date(2026, 6, 29, 20, 30).getTime();
		const end = new Date(2026, 6, 30, 9, 0).getTime();
		expect(formatCompactDateTimeRange(start, end, false)).toBe(
			'Wed, Jul 29, 8:30 PM – Thu, Jul 30, 9:00 AM'
		);
	});

	it('drops the time entirely for a same-day all-day range', () => {
		const start = new Date(2026, 6, 29, 0, 0).getTime();
		const end = new Date(2026, 6, 29, 23, 59).getTime();
		expect(formatCompactDateTimeRange(start, end, true)).toBe('Wed, Jul 29');
	});

	it('shows a day range with no time for a multi-day all-day range', () => {
		const start = new Date(2026, 6, 29, 0, 0).getTime();
		const end = new Date(2026, 6, 30, 23, 59).getTime();
		expect(formatCompactDateTimeRange(start, end, true)).toBe('Wed, Jul 29 – Thu, Jul 30');
	});
});
