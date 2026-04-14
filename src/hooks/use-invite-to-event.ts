/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { endOfDay, startOfDay } from 'date-fns';

import { Invite } from '../types/store/invite';
import { parseDateFromICS } from '../utils/dates';

export const inviteToEvent = (invite: Invite): any => ({
	start: invite.allDay
		? startOfDay(
				invite?.start?.u
					? new Date(invite.start.u)
					: invite?.start?.d
						? new Date(parseDateFromICS(invite.start.d))
						: new Date(0)
			)
		: new Date(invite?.start?.u ?? (invite?.start?.d ? new Date(parseDateFromICS(invite.start.d)).getTime() : 0)),
	end: invite.allDay
		? endOfDay(
				invite?.end?.u
					? new Date(invite.end.u)
					: invite?.end?.d
						? new Date(parseDateFromICS(invite.end.d))
						: new Date(0)
			)
		: new Date(
				(invite?.start?.u ??
					(invite?.start?.d ? new Date(parseDateFromICS(invite.start.d)).getTime() : 0)) +
					((invite?.end?.d ? new Date(parseDateFromICS(invite.end.d)).getTime() : 0) -
						(invite?.start?.d ? new Date(parseDateFromICS(invite.start.d)).getTime() : 0))
			),
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
});

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
