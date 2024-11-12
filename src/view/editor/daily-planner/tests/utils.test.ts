/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DailyPlannerEvents } from '../types';
import {
	getEventTooltipLabel,
	getHumanReadableHours,
	getLocalHoursMinutesFromEpoch,
	getParticipantIcon
} from '../utils';

const mockTranslation = jest.fn().mockImplementation((key: string, defaultValue: string) => key);

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

describe('getHumanReadableHours', () => {
	it('should display AM if time in the morning', () => {
		const time = new Date(2024, 1, 1, 10, 0).getTime();
		expect(getHumanReadableHours(time, 'en-US')).toBe('10:00 AM');
	});

	it('should display numbers with one digit', () => {
		const time = new Date(2024, 1, 1, 9, 0).getTime();
		expect(getHumanReadableHours(time, 'en-US')).toBe('9:00 AM');
	});

	it('should display PM if time in the afternoon', () => {
		const time = new Date(2024, 1, 1, 15, 0).getTime();
		expect(getHumanReadableHours(time, 'en-US')).toBe('3:00 PM');
	});

	it('should display it if time in the afternoon', () => {
		const time = new Date(2024, 1, 1, 15, 0).getTime();
		expect(getHumanReadableHours(time, 'ar-EG')).toBe('٣:٠٠ م');
	});

	it('should format time correctly in it-IT locale', () => {
		const timeEpochMillis = new Date(2024, 11, 12, 14, 30).getTime();
		const result = getHumanReadableHours(timeEpochMillis, 'it-IT');
		expect(result).toBe('14:30');
	});

	it('should format time correctly in fr-FR locale', () => {
		const timeEpochMillis = new Date(2024, 11, 12, 14, 30).getTime();
		const result = getHumanReadableHours(timeEpochMillis, 'fr-FR');
		expect(result).toBe('14:30');
	});

	it('should format time correctly in en-GB locale', () => {
		const timeEpochMillis = new Date('2024-11-12T14:30:00').getTime();
		const result = getHumanReadableHours(timeEpochMillis, 'en-GB');
		expect(result).toBe('14:30');
	});
});

describe('getEventTooltipLabel', () => {
	it('should not display event hours and minutes for non-working', () => {
		const event: DailyPlannerEvents = {
			type: 'non-working',
			startDateEpochMillis: new Date(2024, 1, 1, 10).getTime(),
			endDateEpochMillis: new Date(2024, 1, 1, 12).getTime()
		};
		const result = getEventTooltipLabel(event, mockTranslation, 'en-US');
		expect(result).toBe('daily_planner.status: daily_planner.non-working');
	});

	it('should not display event hours and minutes for free', () => {
		const event: DailyPlannerEvents = {
			type: 'free',
			startDateEpochMillis: new Date(2024, 1, 1, 10).getTime(),
			endDateEpochMillis: new Date(2024, 1, 1, 12).getTime()
		};
		const result = getEventTooltipLabel(event, mockTranslation, 'en-US');
		expect(result).toBe('daily_planner.status: daily_planner.free');
	});

	it('should not display event hours and minutes for unknown', () => {
		const event: DailyPlannerEvents = {
			type: 'unknown',
			startDateEpochMillis: new Date(2024, 1, 1, 10).getTime(),
			endDateEpochMillis: new Date(2024, 1, 1, 12).getTime()
		};
		const result = getEventTooltipLabel(event, mockTranslation, 'en-US');
		expect(result).toBe('daily_planner.status: daily_planner.unknown');
	});

	it('should display event hours and minutes for busy', () => {
		const event: DailyPlannerEvents = {
			type: 'busy',
			startDateEpochMillis: new Date(2024, 1, 1, 10).getTime(),
			endDateEpochMillis: new Date(2024, 1, 1, 12).getTime()
		};
		const result = getEventTooltipLabel(event, mockTranslation, 'en-US');
		expect(result).toBe(
			'daily_planner.status: daily_planner.busy daily_planner.from 10:00 AM daily_planner.to 12:00 PM'
		);
	});

	it('should display event hours and minutes for out-of-office', () => {
		const event: DailyPlannerEvents = {
			type: 'out-of-office',
			startDateEpochMillis: new Date(2024, 1, 1, 14).getTime(),
			endDateEpochMillis: new Date(2024, 1, 1, 16).getTime()
		};
		const result = getEventTooltipLabel(event, mockTranslation, 'en-US');
		expect(result).toBe(
			'daily_planner.status: daily_planner.out-of-office daily_planner.from 2:00 PM daily_planner.to 4:00 PM'
		);
	});

	it('should display event hours and minutes for tentative', () => {
		const event: DailyPlannerEvents = {
			type: 'tentative',
			startDateEpochMillis: new Date(2024, 1, 1, 14).getTime(),
			endDateEpochMillis: new Date(2024, 1, 1, 16).getTime()
		};
		const result = getEventTooltipLabel(event, mockTranslation, 'en-US');
		expect(result).toBe(
			'daily_planner.status: daily_planner.tentative daily_planner.from 2:00 PM daily_planner.to 4:00 PM'
		);
	});
});
