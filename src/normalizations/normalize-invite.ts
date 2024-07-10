/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, find, isNil } from 'lodash';

import {
	normalizeMailPartMapFn,
	getAlarmToString,
	normalizeInviteParticipants,
	retrieveAttachmentsType,
	findAttachments,
	getAlarmValueInMinutes
} from './normalizations-utils';
import { getLocationUrl } from './normalize-calendar-events';
import { Invite } from '../types/store/invite';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const normalizeInvite = (m: any): Invite => ({
	ciFolder: m?.inv?.[0]?.comp?.[0]?.ciFolder,
	allDay: m?.inv?.[0]?.comp?.[0]?.allDay ?? false,
	apptId: m?.inv?.[0]?.comp?.[0]?.apptId,
	tz: find(m?.inv?.[0]?.tz, (value) => value.id !== 'UTC')?.id,
	id: m.id,
	attendees: m?.inv?.[0]?.comp?.[0]?.at ?? [],
	parent: m.l,
	flags: m.f,
	parts: m.mp ? normalizeMailPartMapFn(m.mp) : [],
	alarmString: getAlarmToString(m?.inv?.[0]?.comp?.[0]?.alarm),
	alarmValue: getAlarmValueInMinutes(m?.inv?.[0]?.comp?.[0]?.alarm?.[0]?.trigger?.[0]?.rel?.[0]),
	class: m?.inv?.[0]?.comp?.[0]?.class,
	compNum: m?.inv?.[0]?.comp?.[0]?.compNum, // Component number of the invite
	date: m.d,
	textDescription: m?.inv?.[0]?.comp?.[0]?.desc, // todo: normalize
	htmlDescription: m?.inv?.[0]?.comp?.[0]?.descHtml,
	end: m?.inv?.[0]?.comp?.[0]?.e[0], // todo: normalize
	freeBusy: m?.inv?.[0]?.comp?.[0]?.fb ?? 'B',
	freeBusyActualStatus: m?.inv?.[0]?.comp?.[0]?.fba ?? 'B',
	fragment: m?.inv?.[0]?.comp?.[0]?.fr,
	isOrganizer: m?.inv?.[0]?.comp?.[0]?.isOrg ?? false,
	location: m?.inv?.[0]?.comp?.[0]?.loc ?? '',
	name: m?.inv?.[0]?.comp?.[0]?.name,
	noBlob: m?.inv?.[0]?.comp?.[0]?.noBlob,
	organizer: m?.inv?.[0]?.comp?.[0]?.or, // todo: normalize
	recurrenceRule: m?.inv?.[0]?.comp?.[0]?.recur, // todo: normalize
	isRespRequested: m?.inv?.[0]?.comp?.[0]?.rsvp,
	start: m?.inv?.[0]?.comp?.[0]?.s[0], // todo: normalize
	sequenceNumber: m?.inv?.[0]?.comp?.[0]?.seq,
	status: m?.inv?.[0]?.comp?.[0]?.status,
	transparency: m?.inv?.[0]?.comp?.[0]?.transp, // todo: check what is this for
	uid: m?.inv?.[0]?.comp?.[0]?.uid,
	url: m?.inv?.[0]?.comp?.[0]?.url,
	isException: m?.inv?.[0]?.comp?.[0]?.ex || false,
	exceptId: m?.inv?.[0]?.comp?.[0]?.exceptId, // shown only in exceptions todo: normalize
	tagNamesList: m.tn,
	tags: !isNil(m.t) ? filter(m.t.split(','), (t) => t !== '') : [],
	attach: {
		mp: retrieveAttachmentsType(m?.mp?.[0] ?? [], 'attachment', m?.id)
	},
	attachmentFiles: findAttachments(m.mp ?? [], []),
	participants: normalizeInviteParticipants(m?.inv?.[0]?.comp?.[0]?.at ?? []),
	alarm: !!m?.inv?.[0]?.comp?.[0]?.alarm,
	alarmData: m?.inv?.[0]?.comp?.[0]?.alarm,
	ms: m.ms || 0,
	rev: m.rev || 0,
	meta: m.meta,
	xprop: m?.inv?.[0]?.comp?.[0]?.xprop,
	neverSent: m?.inv?.[0]?.comp?.[0]?.neverSent ?? false,
	locationUrl: getLocationUrl(m?.inv?.[0]?.comp?.[0]?.loc ?? '')
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const normalizeInviteFromSync = (inv: any): Invite => ({
	ciFolder: inv?.comp?.[0]?.ciFolder,
	apptId: inv?.comp?.[0]?.apptId,
	id: `${inv?.comp?.[0]?.apptId}-${inv.id}`,
	attendees: inv.comp?.[0]?.at ?? [],
	parent: inv?.comp?.[0]?.ciFolder, // id folder
	flags: inv.f, // read,unread,attachments,ecc...
	parts: inv.mp ? normalizeMailPartMapFn(inv.mp) : [],
	alarmString: getAlarmToString(inv?.comp?.[0]?.alarm),
	alarmValue: getAlarmValueInMinutes(inv?.comp?.[0]?.alarm?.[0]?.trigger?.[0]?.rel?.[0]),
	class: inv.comp?.[0]?.class,
	compNum: inv.comp?.[0]?.compNum, // Component number of the invite
	date: inv.d, // todo: check what date is
	textDescription: inv.comp?.[0]?.desc, // todo: normalize
	htmlDescription: inv.comp?.[0]?.descHtml,
	end: inv.comp?.[0]?.e[0], // todo: normalize
	freeBusy: inv.comp?.[0]?.fb,
	freeBusyActualStatus: inv.comp?.[0]?.fba,
	fragment: inv.comp?.[0]?.fr,
	isOrganizer: inv.comp?.[0]?.isOrg,
	location: inv.comp?.[0]?.loc ?? '',
	meta: inv.meta,
	name: inv.comp?.[0]?.name,
	noBlob: inv.comp?.[0]?.noBlob,
	organizer: inv.comp?.[0]?.or, // todo: normalize
	recurrenceRule: inv.comp?.[0]?.recur, // todo: normalize
	isRespRequested: inv.comp?.[0]?.rsvp,
	start: inv.comp?.[0]?.s[0], // todo: normalize
	sequenceNumber: inv.comp?.[0]?.seq,
	status: inv.comp?.[0]?.status,
	transparency: inv.comp?.[0]?.transp, // todo: check what is this for
	uid: inv.comp?.[0]?.uid,
	url: inv.comp?.[0]?.url,
	isException: inv.comp?.[0]?.ex || false,
	exceptId: inv.comp?.[0]?.exceptId, // shown only in exceptions todo: normalize
	tagNamesList: inv.tn,
	tags: !isNil(inv.t) ? filter(inv.t.split(','), (t) => t !== '') : [],
	participants: normalizeInviteParticipants(inv.comp?.[0]?.at ?? []),
	alarm: !!inv.comp?.[0]?.alarm,
	alarmData: inv.comp?.[0]?.alarm,
	ms: inv.ms || 0,
	rev: inv.rev || 0,
	xprop: inv.comp?.[0]?.xprop,
	neverSent: inv?.comp?.[0]?.neverSent ?? false,
	locationUrl: getLocationUrl(inv?.comp?.[0]?.loc ?? '')
});
