/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, groupBy, map, reduce, uniqBy } from 'lodash';
import { setLightness } from 'polished';
import { ZIMBRA_STANDARD_COLORS, ZimbraColorType } from '../commons/zimbra-standard-colors';
import { ZimbraFolder } from '../types/zimbra';

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
					response: p.ptst
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

const createStringOfAlarm = (number: any, unit: any): any => `${number} ${unit} BEFORE`;

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

			if ((rel.s || 0) + (rel.m || 0) + (rel.h || 0) + (rel.d || 0) + (rel.w || 0) === 0) {
				return 'At the time of event';
			}
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

export const setCalendarColor = (folder: ZimbraFolder): ZimbraColorType =>
	folder.rgb
		? {
				color: folder.rgb,
				label: 'custom',
				background: setLightness(0.9, folder.rgb)
		  }
		: ZIMBRA_STANDARD_COLORS[0];
