/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
import { groupBy, isNil, map, reduce, uniqBy } from 'lodash';
import { setLightness } from 'polished';

import { DAYS_PER_WEEK, HOURS_PER_DAY, MINUTES_PER_HOUR, SECONDS_PER_MINUTE } from '../constants';
import { CALENDARS_STANDARD_COLORS } from '../constants/calendar';
import { CalendarsColorType } from '../types/store/calendars';
import { AlarmData } from '../types/store/invite';
import { daysToMinutes, hoursToMinutes, secondsToMinutes, weeksToMinutes } from '../utils/times';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const retrieveAttachmentsType = (original: any, disposition: any, dataID: any): any =>
	reduce(
		original.mp ?? [],
		(acc, part) =>
			part.cd && part.cd === disposition ? [...acc, { part: part.part, mid: dataID }] : acc,
		[] as any
	);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const normalizeInviteParticipants = (participants: any): any =>
	groupBy(
		uniqBy(
			map(participants, (p) => ({
				name: p.d,
				email: p.a,
				isOptional: p.role === 'OPT' || false,
				response: p.ptst,
				cutype: p.cutype
			})),
			'email'
		),
		(p) => p.response
	);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const normalizeMailPartMapFn = (v: any): any => {
	const ret: any = {
		contentType: v.ct,
		size: v.s || 0,
		name: v.part
	};
	if (v.mp) {
		ret.parts = map(v.mp || [], normalizeMailPartMapFn);
	}
	if (v.filename) ret.filename = v.filename;
	if (v.content) ret.content = v.content;
	if (v.ci) ret.ci = v.ci;
	if (v.cd) ret.disposition = v.cd;
	return ret;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const findAttachments = (parts: any, acc: any): any =>
	reduce(
		parts,
		(found, part) => {
			if (part && part.cd === 'attachment') {
				found.push(normalizeMailPartMapFn(part));
			}
			if (part.mp) return findAttachments(part.mp, found);
			return acc;
		},
		acc
	);

export type Rel = {
	s?: number;
	m?: number;
	h?: number;
	d?: number;
	w?: number;
};

const isAtTheTimeOfTheEvent = (relativeTrigger: Rel): boolean =>
	relativeTrigger?.s === 0 ||
	relativeTrigger?.m === 0 ||
	relativeTrigger?.h === 0 ||
	relativeTrigger?.d === 0 ||
	relativeTrigger?.w === 0;

export const getAlarmValueInMinutes = (relativeTrigger?: Rel): string => {
	const AT_THE_TIME_OF_THE_EVENT = '-1';
	const NO_TRIGGER = '0';
	const MINIMUM_TRIGGER_VALUE = '1';

	if (!relativeTrigger) {
		return NO_TRIGGER;
	}
	if (isAtTheTimeOfTheEvent(relativeTrigger)) {
		return AT_THE_TIME_OF_THE_EVENT;
	}
	if (!isNil(relativeTrigger.s)) {
		if (relativeTrigger.s % SECONDS_PER_MINUTE === 0) {
			return secondsToMinutes(relativeTrigger.s).toString();
		}
		return MINIMUM_TRIGGER_VALUE;
	}
	if (!isNil(relativeTrigger.m)) {
		return relativeTrigger.m.toString();
	}
	if (!isNil(relativeTrigger.h)) {
		return hoursToMinutes(relativeTrigger.h).toString();
	}
	if (!isNil(relativeTrigger.d)) {
		return daysToMinutes(relativeTrigger.d).toString();
	}
	if (!isNil(relativeTrigger.w)) {
		return weeksToMinutes(relativeTrigger.w).toString();
	}
	return AT_THE_TIME_OF_THE_EVENT;
};

export const getAlarmToString = (alarm?: AlarmData): string => {
	if (alarm && alarm[0] && alarm[0].action === 'DISPLAY') {
		const rel = alarm[0].trigger[0].rel[0];

		if (rel) {
			const seconds =
				(rel.s || 0) +
				(rel.m || 0) * SECONDS_PER_MINUTE +
				(rel.h || 0) * SECONDS_PER_MINUTE * MINUTES_PER_HOUR +
				(rel.d || 0) * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY +
				(rel.w || 0) * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY * DAYS_PER_WEEK;

			if ((rel.s || 0) + (rel.m || 0) + (rel.h || 0) + (rel.d || 0) + (rel.w || 0) === 0) {
				return t('reminder.at_time_of_event', 'At the time of the event');
			}
			if (seconds % (SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY * DAYS_PER_WEEK) === 0) {
				const weeks =
					seconds / (SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY * DAYS_PER_WEEK);
				return t('reminder.week_before', {
					count: weeks,
					defaultValue_one: '{{count}} week before',
					defaultValue_other: '{{count}} weeks before'
				});
			}
			if (seconds % (SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY) === 0) {
				const days = seconds / (SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY);
				return t('reminder.day_before', {
					count: days,
					defaultValue_one: '{{count}} day before',
					defaultValue_other: '{{count}} days before'
				});
			}
			if (seconds % (SECONDS_PER_MINUTE * MINUTES_PER_HOUR) === 0) {
				const hours = seconds / (SECONDS_PER_MINUTE * MINUTES_PER_HOUR);
				return t('reminder.hour_before', {
					count: hours,
					defaultValue_one: '{{count}} hour before',
					defaultValue_other: '{{count}} hours before'
				});
			}
			if (seconds % SECONDS_PER_MINUTE === 0) {
				const minutes = seconds / SECONDS_PER_MINUTE;
				return t('reminder.minute_before', {
					count: minutes,
					defaultValue_one: '{{count}} minute before',
					defaultValue_other: '{{count}} minutes before'
				});
			}
			return t('reminder.second_before', {
				count: seconds,
				defaultValue_one: '{{count}} second before',
				defaultValue_other: '{{count}} seconds before'
			});
		}
	}
	return 'never';
};

export const setCalendarColorFromRGB = (color: string | undefined): CalendarsColorType =>
	color
		? {
				color,
				label: 'custom',
				background: setLightness(0.9, color)
			}
		: CALENDARS_STANDARD_COLORS[0];

export const setCalendarColorFromNumber = (color: number | undefined): CalendarsColorType =>
	CALENDARS_STANDARD_COLORS?.[color ?? 0] ?? CALENDARS_STANDARD_COLORS[0];

export const setCalendarColor = ({
	rgb,
	color
}: {
	rgb?: string;
	color?: number;
}): CalendarsColorType => {
	if (rgb) {
		return setCalendarColorFromRGB(rgb);
	}
	if (color) {
		return setCalendarColorFromNumber(color);
	}
	return CALENDARS_STANDARD_COLORS[0];
};
