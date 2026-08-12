/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	getNewlyAddedAttendees,
	haveAttendeesChanged,
	haveNonAttendeeFieldsChanged
} from './attendees';
import { Editor } from '../types/editor';
import { EditorChipAttendees } from '../types/store/invite';

const attendee = (email: string): EditorChipAttendees => ({ email });

const makeEditor = (overrides: Partial<Editor> = {}): Editor =>
	({
		id: 'editor-1',
		isDirty: false,
		disabled: {},
		panel: false,
		isNew: false,
		isException: false,
		isInstance: false,
		isSeries: false,
		compNum: 0,
		title: 'Original Title',
		location: 'Original Location',
		attendees: [attendee('a@example.com')],
		optionalAttendees: [],
		...overrides
	}) as Editor;

describe('haveAttendeesChanged', () => {
	test('returns false when the lists are identical', () => {
		const current = [attendee('a@example.com'), attendee('b@example.com')];
		const original = [attendee('a@example.com'), attendee('b@example.com')];
		expect(haveAttendeesChanged(current, original)).toBe(false);
	});

	test('returns false when only the order differs', () => {
		const current = [attendee('b@example.com'), attendee('a@example.com')];
		const original = [attendee('a@example.com'), attendee('b@example.com')];
		expect(haveAttendeesChanged(current, original)).toBe(false);
	});

	test('is case-insensitive on email comparison', () => {
		const current = [attendee('A@example.com')];
		const original = [attendee('a@example.com')];
		expect(haveAttendeesChanged(current, original)).toBe(false);
	});

	test('returns true when an attendee was added', () => {
		const current = [attendee('a@example.com'), attendee('b@example.com')];
		const original = [attendee('a@example.com')];
		expect(haveAttendeesChanged(current, original)).toBe(true);
	});

	test('returns true when an attendee was removed', () => {
		const current = [attendee('a@example.com')];
		const original = [attendee('a@example.com'), attendee('b@example.com')];
		expect(haveAttendeesChanged(current, original)).toBe(true);
	});

	test('handles undefined lists as empty', () => {
		expect(haveAttendeesChanged(undefined, undefined)).toBe(false);
		expect(haveAttendeesChanged([attendee('a@example.com')], undefined)).toBe(true);
	});
});

describe('getNewlyAddedAttendees', () => {
	test('returns an empty array when nothing changed', () => {
		const current = [attendee('a@example.com')];
		const original = [attendee('a@example.com')];
		expect(getNewlyAddedAttendees(current, original)).toEqual([]);
	});

	test('returns only the attendees not present in the original list', () => {
		const newAttendee = attendee('new@example.com');
		const current = [attendee('a@example.com'), newAttendee];
		const original = [attendee('a@example.com')];
		expect(getNewlyAddedAttendees(current, original)).toEqual([newAttendee]);
	});

	test('is case-insensitive on email comparison', () => {
		const current = [attendee('A@example.com')];
		const original = [attendee('a@example.com')];
		expect(getNewlyAddedAttendees(current, original)).toEqual([]);
	});

	test('handles undefined lists as empty', () => {
		expect(getNewlyAddedAttendees(undefined, undefined)).toEqual([]);
		const current = [attendee('a@example.com')];
		expect(getNewlyAddedAttendees(current, undefined)).toEqual(current);
	});
});

describe('haveNonAttendeeFieldsChanged', () => {
	test('returns false when the editors are identical', () => {
		const current = makeEditor();
		const original = makeEditor();
		expect(haveNonAttendeeFieldsChanged(current, original)).toBe(false);
	});

	test('returns true when a non-attendee field differs', () => {
		const current = makeEditor({ title: 'Updated Title' });
		const original = makeEditor();
		expect(haveNonAttendeeFieldsChanged(current, original)).toBe(true);
	});

	test('ignores differences in attendees and optionalAttendees', () => {
		const current = makeEditor({
			attendees: [attendee('a@example.com'), attendee('b@example.com')],
			optionalAttendees: [attendee('c@example.com')]
		});
		const original = makeEditor();
		expect(haveNonAttendeeFieldsChanged(current, original)).toBe(false);
	});

	test('ignores differences in metadata fields (isDirty, panel, compNum, isNew...)', () => {
		const current = makeEditor({ isDirty: true, panel: true, compNum: 3, isNew: true });
		const original = makeEditor();
		expect(haveNonAttendeeFieldsChanged(current, original)).toBe(false);
	});

	test('returns true when current is undefined', () => {
		expect(haveNonAttendeeFieldsChanged(undefined, makeEditor())).toBe(true);
	});

	test('returns true when original is undefined', () => {
		expect(haveNonAttendeeFieldsChanged(makeEditor(), undefined)).toBe(true);
	});
});
