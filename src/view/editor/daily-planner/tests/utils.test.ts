/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DailyPlannerFreeBusy, DailyPlannerFreeBusyEvent } from '../types';
import { getLocalHoursMinutesFromEpoch, getParticipantIcon, parseFreeBusyEvent } from '../utils';

describe('getLocalHoursMinutesFromEpoch', () => {
	it('should correctly extract hours and minutes from a timestamp', () => {
		const timestamp = new Date(2023, 1, 1, 10, 0).getTime();
		const expected = { hours: 10, minutes: 0 };

		const result = getLocalHoursMinutesFromEpoch(timestamp);
		expect(result).toEqual(expected);
	});

	it('should handle midnight correctly', () => {
		const timestamp = new Date(2023, 1, 1, 0, 0).getTime();
		const expected = { hours: 0, minutes: 0 };

		const result = getLocalHoursMinutesFromEpoch(timestamp);
		expect(result).toEqual(expected);
	});

	it('should handle noon correctly', () => {
		const timestamp = new Date(2023, 1, 1, 12, 0).getTime();
		const expected = { hours: 12, minutes: 0 };

		const result = getLocalHoursMinutesFromEpoch(timestamp);
		expect(result).toEqual(expected);
	});

	it('should handle times with non-zero minutes correctly', () => {
		const timestamp = new Date(2023, 1, 1, 15, 45).getTime();
		const expected = { hours: 15, minutes: 45 };

		const result = getLocalHoursMinutesFromEpoch(timestamp);
		expect(result).toEqual(expected);
	});
});

describe('parseFreeBusyEvent', () => {
	it('should correctly parse the event type, start time, and end time', () => {
		const mockEvent: DailyPlannerFreeBusy = {
			type: 'free',
			startDate: new Date(2024, 1, 1, 10, 0).getTime(),
			endDate: new Date(2024, 1, 1, 11, 0).getTime()
		};

		const expectedParsedEvent: DailyPlannerFreeBusyEvent = {
			type: 'free',
			start: { hours: 10, minutes: 0 },
			end: { hours: 11, minutes: 0 }
		};

		const result = parseFreeBusyEvent(mockEvent);
		expect(result).toEqual(expectedParsedEvent);
	});

	it('should handle events that span multiple hours in the same day', () => {
		const mockEvent: DailyPlannerFreeBusy = {
			type: 'free',
			startDate: new Date(2024, 1, 1, 10, 0).getTime(),
			endDate: new Date(2024, 1, 1, 15, 0).getTime()
		};

		const expectedParsedEvent: DailyPlannerFreeBusyEvent = {
			type: 'free',
			start: { hours: 10, minutes: 0 },
			end: { hours: 15, minutes: 0 }
		};

		const result = parseFreeBusyEvent(mockEvent);
		expect(result).toEqual(expectedParsedEvent);
	});

	it('should handle events that span multiple hours over multiple days', () => {
		const mockEvent: DailyPlannerFreeBusy = {
			type: 'free',
			startDate: new Date(2024, 1, 1, 10, 0).getTime(),
			endDate: new Date(2024, 2, 2, 15, 0).getTime()
		};

		const expectedParsedEvent: DailyPlannerFreeBusyEvent = {
			type: 'free',
			start: { hours: 10, minutes: 0 },
			end: { hours: 15, minutes: 0 }
		};

		const result = parseFreeBusyEvent(mockEvent);
		expect(result).toEqual(expectedParsedEvent);
	});

	it('should handle events with non-zero minutes correctly', () => {
		const mockEvent: DailyPlannerFreeBusy = {
			type: 'free',
			startDate: new Date(2024, 1, 1, 10, 30).getTime(),
			endDate: new Date(2024, 1, 1, 15, 45).getTime()
		};

		const expectedParsedEvent: DailyPlannerFreeBusyEvent = {
			type: 'free',
			start: { hours: 10, minutes: 30 },
			end: { hours: 15, minutes: 45 }
		};

		const result = parseFreeBusyEvent(mockEvent);
		expect(result).toEqual(expectedParsedEvent);
	});
});

describe('getParticipantIcon', () => {
	it('should return Person for organizer', () => {
		expect(getParticipantIcon('organizer')).toBe('Person');
	});
	it('should return Person for attendee', () => {
		expect(getParticipantIcon('attendee')).toBe('Person');
	});
	it('should return Building for meeting room', () => {
		expect(getParticipantIcon('meetingRoom')).toBe('Building');
	});
	it('should return Briefcase for equipment', () => {
		expect(getParticipantIcon('equipment')).toBe('Briefcase');
	});
	it('should return PersonOutline for optional attendee', () => {
		expect(getParticipantIcon('optionalAttendee')).toBe('PersonOutline');
	});
});
