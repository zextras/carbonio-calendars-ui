/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getInviteChanges } from '../get-invite-changes';
import { getTimeStrings } from '../../hooks/use-get-date-range-converted-to-timezone';
import { Editor } from '../../types/editor';

const dateTimeLabel = (start: number, end: number): string =>
	getTimeStrings({ start, end, options: {} });

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

	it('detects an added resource (meeting room or equipment)', () => {
		const original = buildEditor({ meetingRoom: [], equipment: [] });
		const current = buildEditor({
			meetingRoom: [{ email: 'room@test.com', label: 'Room A' }],
			equipment: [{ email: 'projector@test.com', label: 'Projector' }]
		});
		expect(getInviteChanges(original, current)).toEqual({
			resources: {
				added: [
					{ a: 'room@test.com', d: 'Room A' },
					{ a: 'projector@test.com', d: 'Projector' }
				],
				removed: []
			}
		});
	});

	it('detects a removed resource', () => {
		const original = buildEditor({ meetingRoom: [{ email: 'room@test.com', label: 'Room A' }] });
		const current = buildEditor({ meetingRoom: [] });
		expect(getInviteChanges(original, current)).toEqual({
			resources: { added: [], removed: [{ a: 'room@test.com', d: 'Room A' }] }
		});
	});

	it('ignores resources without an email', () => {
		const original = buildEditor({ meetingRoom: [] });
		const current = buildEditor({ meetingRoom: [{ email: '', label: 'Deleted Room' }] as never });
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

	it('detects an all day change', () => {
		const original = buildEditor({ allDay: false });
		const current = buildEditor({ allDay: true });
		expect(getInviteChanges(original, current)).toEqual({
			allDay: { before: false, after: true }
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
				after: dateTimeLabel(1500, 2500)
			}
		});
	});

	it('detects only the end time changing', () => {
		const original = buildEditor({ start: 1000, end: 2000 });
		const current = buildEditor({ start: 1000, end: 2500 });
		expect(getInviteChanges(original, current)).toEqual({
			dateTime: {
				before: dateTimeLabel(1000, 2000),
				after: dateTimeLabel(1000, 2500)
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
				after: dateTimeLabel(1500, 2500)
			},
			participants: {
				added: [{ a: 'new@test.com', d: 'New' }],
				removed: [{ a: 'old@test.com', d: 'Old' }]
			}
		});
	});
});
