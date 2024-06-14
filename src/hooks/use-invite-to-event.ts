/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment from 'moment';

import { Invite } from '../types/store/invite';

export const inviteToEvent = (invite: Invite): any => ({
	start: invite.allDay
		? new Date(moment(invite?.start?.d).startOf('day').valueOf())
		: new Date(moment(invite?.start?.d).valueOf() ?? invite?.start?.u),
	end: invite.allDay
		? new Date(
				moment(invite?.start?.d)
					.add(
						moment
							.duration(moment(invite.end.d).diff(moment(invite.start.d)), 'milliseconds')
							.asDays(),
						'days'
					)
					.endOf('day')
					.valueOf()
			)
		: new Date(
				(invite?.start?.u ?? moment(invite?.start?.d).valueOf()) +
					moment(invite.end.d).diff(moment(invite.start.d))
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
		iAmVisitor: !invite.isOrganizer ?? false,
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
		iAmVisitor: !invite.isOrganizer ?? false,
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
