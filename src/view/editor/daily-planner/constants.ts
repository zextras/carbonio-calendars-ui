/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const DAILY_PLANNER_EVENT_TYPE = {
	free: 'free',
	busy: 'busy',
	tentative: 'tentative',
	outOfOffice: 'out-of-office',
	nonWorking: 'non-working',
	unknown: 'unknown'
} as const;

export const DAILY_PLANNER_PARTICIPANT_TYPE = {
	organizer: 'organizer',
	attendee: 'attendee',
	optionalAttendee: 'optionalAttendee',
	meetingRoom: 'meetingRoom',
	equipment: 'equipment'
} as const;
