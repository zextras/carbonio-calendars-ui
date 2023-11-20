/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { t } from '@zextras/carbonio-shell-ui';
import { filter, groupBy, map, reduce, uniqBy } from 'lodash';
import { setLightness } from 'polished';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { ZIMBRA_STANDARD_COLORS, ZimbraColorType } from '../commons/zimbra-standard-colors';

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
			map(
				filter(participants, (p) => p.cutype !== 'RES'),
				(p) => ({
					name: p.d,
					email: p.a,
					isOptional: p.role === 'OPT' || false,
					response: p.ptst,
					cutype: p.cutype
				})
			),
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getAlarmToString = (alarm: any): any => {
	const DAY_PER_WEEK = 7;
	const HOUR_PER_DAY = 24;
	const MINUTES_PER_HOUR = 60;
	const SECONDS_PER_MINUTE = 60;

	if (alarm && alarm[0] && alarm[0].action === 'DISPLAY') {
		const rel = alarm[0].trigger[0].rel[0];

		if (rel) {
			const seconds =
				(rel.s || 0) +
				(rel.m || 0) * SECONDS_PER_MINUTE +
				(rel.h || 0) * SECONDS_PER_MINUTE * MINUTES_PER_HOUR +
				(rel.d || 0) * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOUR_PER_DAY +
				(rel.w || 0) * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOUR_PER_DAY * DAY_PER_WEEK;

			if ((rel.s || 0) + (rel.m || 0) + (rel.h || 0) + (rel.d || 0) + (rel.w || 0) === 0) {
				return t('reminder.at_time_of_event', 'At the time of the event');
			}
			if (seconds % (SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOUR_PER_DAY * DAY_PER_WEEK) === 0) {
				const weeks =
					seconds / (SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOUR_PER_DAY * DAY_PER_WEEK);
				return t('reminder.week_before', {
					count: weeks,
					defaultValue: '{{count}} week before',
					defaultValue_plural: '{{count}} weeks before'
				});
			}
			if (seconds % (SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOUR_PER_DAY) === 0) {
				const days = seconds / (SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOUR_PER_DAY);
				return t('reminder.day_before', {
					count: days,
					defaultValue: '{{count}} day before',
					defaultValue_plural: '{{count}} days before'
				});
			}
			if (seconds % (SECONDS_PER_MINUTE * MINUTES_PER_HOUR) === 0) {
				const hours = seconds / (SECONDS_PER_MINUTE * MINUTES_PER_HOUR);
				return t('reminder.hour_before', {
					count: hours,
					defaultValue: '{{count}} hour before',
					defaultValue_plural: '{{count}} hours before'
				});
			}
			if (seconds % SECONDS_PER_MINUTE === 0) {
				const minutes = seconds / SECONDS_PER_MINUTE;
				return t('reminder.minute_before', {
					count: minutes,
					defaultValue: '{{count}} minute before',
					defaultValue_plural: '{{count}} minutes before'
				});
			}
			return t('reminder.second_before', {
				count: seconds,
				defaultValue: '{{count}} second before',
				defaultValue_plural: '{{count}} seconds before'
			});
		}
	}
	return null;
};

export const setCalendarColorFromRGB = (color: string | undefined): ZimbraColorType =>
	color
		? {
				color,
				label: 'custom',
				background: setLightness(0.9, color)
		  }
		: ZIMBRA_STANDARD_COLORS[0];

export const setCalendarColorFromNumber = (color: number | undefined): ZimbraColorType =>
	color ? ZIMBRA_STANDARD_COLORS[color] : ZIMBRA_STANDARD_COLORS[0];

export const setCalendarColor = ({
	rgb,
	color
}: {
	rgb?: string;
	color?: number;
}): ZimbraColorType => {
	if (rgb) {
		return setCalendarColorFromRGB(rgb);
	}
	if (color) {
		return setCalendarColorFromNumber(color);
	}
	return ZIMBRA_STANDARD_COLORS[0];
};
