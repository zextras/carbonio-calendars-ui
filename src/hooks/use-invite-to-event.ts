/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { endOfDay, startOfDay } from 'date-fns';

import { Invite } from '../types/store/invite';
import { parseDateFromICS } from '../utils/dates';

function resolveTimestamp(comp: { u?: number; d?: string } | undefined): number {
	if (comp === undefined) return 0;
	if (comp.u !== undefined) return comp.u;
	if (comp.d) return parseDateFromICS(comp.d).getTime();
	return 0;
}

export const inviteToEvent = (invite: Invite): any => {
	const startDate = new Date(resolveTimestamp(invite?.start));
	const endDate = new Date(resolveTimestamp(invite?.end));
	return {
		start: invite.allDay ? startOfDay(startDate) : startDate,
		end: invite.allDay ? endOfDay(endDate) : endDate,
		resource: {
			id: invite.apptId,
			inviteId: invite.id,
			ridZ: '',
			calendar: {
				id: invite.parent,
				name: '',
				color: '',
				owner: ''
			},
			flags: '',
			iAmOrganizer: invite.isOrganizer ?? false,
			iAmVisitor: !invite.isOrganizer,
			iAmAttendee: invite.isOrganizer ?? false,
			status: invite.status,
			location: invite.location || '',
			fragment: invite.fragment || '',
			class: invite.class,
			freeBusy: invite.freeBusy,
			isRecurrent: !!(invite.exceptId || invite.recurrenceRule),
			isException: invite.isException ?? false,
			organizer: invite.organizer,
			compNum: invite.compNum,
			apptStart: invite.start,
			alarm: invite.alarm,
			alarmData: invite.alarmData,
			uid: invite.uid,
			ms: invite.ms,
			rev: invite.rev
		},
		title: invite.name,
		allDay: invite.allDay ?? false
	};
};

export const appointmentToEvent = (invite: Invite, id: string): any => ({
	start: invite.start.u ? invite.start.u : invite.start,
	end: invite.end.u ? invite.end.u : invite.end,
	resource: {
		id: invite.apptId,
		inviteId: id ? `${invite.apptId}-${id}` : invite.id,
		ridZ: '',
		calendar: {
			id: invite.parent,
			name: '',
			color: '',
			owner: ''
		},
		flags: '',
		iAmOrganizer: invite.isOrganizer ?? false,
		iAmVisitor: !invite.isOrganizer,
		iAmAttendee: invite.isOrganizer ?? false,
		status: invite.status,
		location: invite.location,
		fragment: invite.fragment,
		class: invite.class,
		freeBusy: invite.freeBusy,
		isRecurrent: !!(invite.exceptId || invite.recurrenceRule),
		isException: invite.isException ?? false,
		organizer: invite.organizer,
		compNum: invite.compNum,
		apptStart: invite.start,
		alarm: invite.alarm,
		alarmData: invite.alarmData,
		uid: invite.uid,
		ms: invite.ms,
		rev: invite.rev
	},
	title: invite.name,
	allDay: false
});
