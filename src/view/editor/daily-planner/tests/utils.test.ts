/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DAILY_PLANNER_EVENT_TYPE, DAILY_PLANNER_PARTICIPANT_TYPE } from '../constants';
import { DailyPlannerEvents } from '../types';
import { ParticipantAvailability } from '../use-participants-availability';
import { NonWorkingHours } from '../use-participants-non-working-hours';
import {
	atMidnight,
	getEventTooltipLabel,
	getHumanReadableHours,
	getLocalHoursMinutesFromEpoch,
	getParticipantIcon,
	getWithinSameDay,
	mapFreeBusyToDailyPlannerRow,
	onNextDay
} from '../utils';

const mockTranslation = vi.fn().mockImplementation((key: string, defaultValue: string) => key);

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

describe('getWithinSameDay', () => {
	it('should return true for dates within the same day', () => {
		const startDate = new Date('2023-10-01T10:00:00').getTime();
		const endDate = new Date('2023-10-01T15:00:00').getTime();
		expect(getWithinSameDay(startDate, endDate)).toBe(true);
	});

	it('should return false for dates on different days', () => {
		const startDate = new Date('2023-10-01T23:59:59').getTime();
		const endDate = new Date('2023-10-02T00:00:00').getTime();
		expect(getWithinSameDay(startDate, endDate)).toBe(false);
	});

	it('should return false for dates in different months', () => {
		const startDate = new Date('2023-09-30T23:59:59').getTime();
		const endDate = new Date('2023-10-01T00:00:00').getTime();
		expect(getWithinSameDay(startDate, endDate)).toBe(false);
	});

	it('should return false for dates in different years', () => {
		const startDate = new Date('2022-12-31T23:59:59').getTime();
		const endDate = new Date('2023-01-01T00:00:00').getTime();
		expect(getWithinSameDay(startDate, endDate)).toBe(false);
	});
});

describe('mapFreeBusyToDailyPlannerRow', () => {
	it('should map free/busy data to daily planner row correctly', () => {
		const email = 'test@example.com';
		const fullName = 'Test User';
		const participantType = DAILY_PLANNER_PARTICIPANT_TYPE.organizer;
		const availabilities: Record<string, ParticipantAvailability> = {
			'test@example.com': {
				free: [{ startDateEpochMillis: 1, endDateEpochMillis: 2 }],
				busy: [{ startDateEpochMillis: 3, endDateEpochMillis: 4 }],
				tentative: [{ startDateEpochMillis: 5, endDateEpochMillis: 6 }],
				outOfOffice: [{ startDateEpochMillis: 7, endDateEpochMillis: 8 }],
				unknown: [{ startDateEpochMillis: 9, endDateEpochMillis: 10 }]
			}
		};
		const nonWorkingHours: Record<string, NonWorkingHours> = {
			'test@example.com': {
				nonWorkingHours: [{ startDateEpochMillis: 11, endDateEpochMillis: 12 }]
			}
		};

		const result = mapFreeBusyToDailyPlannerRow({
			email,
			fullName,
			participantType,
			availabilities,
			nonWorkingHours
		});

		expect(result).toMatchObject({
			email,
			fullName,
			participantType,
			events: [
				{ startDateEpochMillis: 1, endDateEpochMillis: 2, type: DAILY_PLANNER_EVENT_TYPE.free },
				{
					startDateEpochMillis: 11,
					endDateEpochMillis: 12,
					type: DAILY_PLANNER_EVENT_TYPE.nonWorking
				},
				{ startDateEpochMillis: 9, endDateEpochMillis: 10, type: DAILY_PLANNER_EVENT_TYPE.unknown },
				{
					startDateEpochMillis: 5,
					endDateEpochMillis: 6,
					type: DAILY_PLANNER_EVENT_TYPE.tentative
				},
				{ startDateEpochMillis: 3, endDateEpochMillis: 4, type: DAILY_PLANNER_EVENT_TYPE.busy },
				{
					startDateEpochMillis: 7,
					endDateEpochMillis: 8,
					type: DAILY_PLANNER_EVENT_TYPE.outOfOffice
				}
			]
		});
	});

	it('should handle missing availabilities and non-working hours', () => {
		const email = 'test@example.com';
		const participantType = DAILY_PLANNER_PARTICIPANT_TYPE.organizer;
		const availabilities: Record<string, ParticipantAvailability> = {};
		const nonWorkingHours: Record<string, NonWorkingHours> = {};

		const result = mapFreeBusyToDailyPlannerRow({
			email,
			participantType,
			availabilities,
			nonWorkingHours
		});

		expect(result).toEqual({
			email,
			fullName: undefined,
			participantType,
			events: []
		});
	});
});

describe('atMidnight', () => {
	it('should set the time to midnight', () => {
		const date = new Date('2023-10-01T10:00:00');
		const result = atMidnight(date);
		expect(result.getHours()).toBe(0);
		expect(result.getMinutes()).toBe(0);
		expect(result.getSeconds()).toBe(0);
		expect(result.getMilliseconds()).toBe(0);
	});

	it('should not change the date', () => {
		const date = new Date('2023-10-01T10:00:00');
		const result = atMidnight(date);
		expect(result.getFullYear()).toBe(2023);
		expect(result.getMonth()).toBe(9); // Months are zero-based
		expect(result.getDate()).toBe(1);
	});
});

describe('onNextDay', () => {
	it('should set the date to the next day', () => {
		const date = new Date('2023-10-01T10:00:00');
		const result = onNextDay(date);
		expect(result.getFullYear()).toBe(2023);
		expect(result.getMonth()).toBe(9); // Months are zero-based
		expect(result.getDate()).toBe(2);
	});

	it('should handle month boundaries', () => {
		const date = new Date('2023-09-30T10:00:00');
		const result = onNextDay(date);
		expect(result.getFullYear()).toBe(2023);
		expect(result.getMonth()).toBe(9); // Months are zero-based
		expect(result.getDate()).toBe(1);
	});

	it('should handle year boundaries', () => {
		const date = new Date('2023-12-31T10:00:00');
		const result = onNextDay(date);
		expect(result.getFullYear()).toBe(2024);
		expect(result.getMonth()).toBe(0); // Months are zero-based
		expect(result.getDate()).toBe(1);
	});
});
