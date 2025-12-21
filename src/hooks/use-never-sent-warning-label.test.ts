/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNeverSentWarningLabel } from './use-never-sent-warning-label';
import { CALENDAR_RESOURCES, INVITE_NEVER_SENT_WARNING_LABELS } from '../constants';
import { Attendee } from '../types/store/invite';
import { setupHook } from '@test-setup';

const buildAttendee = (args: Partial<Attendee> = {}): Attendee => ({
	a: 'random a',
	d: 'random d',
	ptst: 'AC',
	role: 'REQ',
	rsvp: true,
	url: ' random url',
	...args
});
describe('useNeverSentWarningLabel', () => {
	it('return a generic string when no attendees are passed as argument', async () => {
		const { result } = setupHook(useNeverSentWarningLabel);
		expect(result.current).toEqual(INVITE_NEVER_SENT_WARNING_LABELS.DEFAULT);
	});
	it('return a participant specific string when an attendee is passed as argument', async () => {
		const attendees: Attendee[] = [buildAttendee()];
		const { result } = setupHook(useNeverSentWarningLabel, {
			initialProps: [attendees]
		});

		expect(result.current).toEqual(INVITE_NEVER_SENT_WARNING_LABELS.ATTENDEES);
	});
	it('return a resource specific string when a room is passed as argument', async () => {
		const attendees: Attendee[] = [buildAttendee({ cutype: CALENDAR_RESOURCES.ROOM })];
		const { result } = setupHook(useNeverSentWarningLabel, {
			initialProps: [attendees]
		});

		expect(result.current).toEqual(INVITE_NEVER_SENT_WARNING_LABELS.RESOURCES);
	});
	it('return a resource specific string when a resource is passed as argument', async () => {
		const attendees: Attendee[] = [buildAttendee({ cutype: CALENDAR_RESOURCES.RESOURCE })];
		const { result } = setupHook(useNeverSentWarningLabel, {
			initialProps: [attendees]
		});

		expect(result.current).toEqual(INVITE_NEVER_SENT_WARNING_LABELS.RESOURCES);
	});

	it('will prioritize attendee string when both resource and attendee are passed as argument', async () => {
		const attendees: Attendee[] = [buildAttendee({ cutype: CALENDAR_RESOURCES.RESOURCE })];
		const { result } = setupHook(useNeverSentWarningLabel, {
			initialProps: [attendees]
		});

		expect(result.current).toEqual(INVITE_NEVER_SENT_WARNING_LABELS.RESOURCES);
	});
});
