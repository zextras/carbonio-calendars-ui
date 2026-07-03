/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getNewlyAddedAttendees, haveAttendeesChanged } from './attendees';
import { EditorChipAttendees } from '../types/store/invite';

const attendee = (email: string): EditorChipAttendees => ({ email });

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
