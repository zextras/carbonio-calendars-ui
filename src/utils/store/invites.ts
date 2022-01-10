/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { map } from 'lodash';

const createStringOfAlarm = (number: any, unit: any): any => `${number} ${unit} BEFORE`;

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
export const getAlarmToString = (alarm: any): any => {
	const DAY_PER_WEEK = 7;
	const HOUR_PER_DAY = 24;
	const MINUTES_PER_HOUR = 60;
	const SECONDS_PER_MINUTE = 60;

	if (alarm && alarm[0] && alarm[0].action === 'DISPLAY') {
		const rel = alarm[0].trigger[0].rel[0];

		if (rel) {
			let [number, unit] = [null, null];
			const seconds =
				(rel.s || 0) +
				(rel.m || 0) * SECONDS_PER_MINUTE +
				(rel.h || 0) * SECONDS_PER_MINUTE * MINUTES_PER_HOUR +
				(rel.d || 0) * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOUR_PER_DAY +
				(rel.w || 0) * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOUR_PER_DAY * DAY_PER_WEEK;

			if (seconds % (SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOUR_PER_DAY * DAY_PER_WEEK) === 0) {
				const weeks =
					seconds / (SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOUR_PER_DAY * DAY_PER_WEEK);
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				[number, unit] = [weeks, `WEEK${weeks > 1 ? 'S' : ''}`];
			} else if (seconds % (SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOUR_PER_DAY) === 0) {
				const days = seconds / (SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOUR_PER_DAY);
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				[number, unit] = [days, `DAY${days > 1 ? 'S' : ''}`];
			} else if (seconds % (SECONDS_PER_MINUTE * MINUTES_PER_HOUR) === 0) {
				const hours = seconds / (SECONDS_PER_MINUTE * MINUTES_PER_HOUR);
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				[number, unit] = [hours, `HOUR${hours > 1 ? 'S' : ''}`];
			} else if (seconds % SECONDS_PER_MINUTE === 0) {
				const minutes = seconds / SECONDS_PER_MINUTE;
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				[number, unit] = [minutes, `MINUTE${minutes > 1 ? 'S' : ''}`];
			} else {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				[number, unit] = [seconds, `SECOND${number > 1 ? 'S' : ''}`];
			}
			return createStringOfAlarm(number, unit);
		}
	}
	return null;
};
