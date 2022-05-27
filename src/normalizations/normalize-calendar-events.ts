/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find, reduce, map, isEmpty } from 'lodash';
import moment from 'moment';
import { EventResource, EventType } from '../types/event';
import { Appointment, ExceptionReference, InstanceReference } from '../types/store/appointments';
import { Calendar } from '../types/store/calendars';

export const locationUrl = (location: string): string | undefined => {
	const regex = /\bhttps?:\/\/\S+/g;
	const found = location?.match(regex);

	return found?.length ? found[0] : undefined;
};

const normalizeEventResource = (
	appt: Appointment,
	inst: ExceptionReference,
	calendar: Calendar
): EventResource => ({
	id: appt.id,
	inviteId: inst.inviteId ?? appt.inviteId,
	ridZ: inst.ridZ,
	calendar: {
		id: calendar.id,
		name: calendar.name,
		color: calendar.color,
		owner: calendar.owner
	},
	flags: appt.flags,
	iAmOrganizer: appt.isOrg ?? false,
	iAmVisitor: !!(!appt.isOrg && calendar.owner) ?? false,
	iAmAttendee: (!appt.isOrg && !calendar.owner) ?? false,
	status: appt.status,
	location: appt.loc,
	locationUrl: locationUrl(appt.loc ?? ''),
	fragment: (inst as ExceptionReference)?.fr ?? appt.fr,
	class: appt.class,
	freeBusy: appt.fb,
	hasChangesNotNotified: appt.draft || false,
	inviteNeverSent: appt.neverSent || false,
	hasOtherAttendees: appt.otherAtt ?? false,
	isRecurrent: inst.recur ?? appt.recur,
	isException: inst.ex ?? false,
	participationStatus: appt.ptst,
	organizer: {
		name: appt?.or?.d,
		email: appt?.or?.a
	},
	compNum: appt.compNum,
	apptStart: inst.s,
	alarm: appt.alarm,
	alarmData: appt.alarmData,
	uid: appt.uid,
	tags: appt.tags ?? [],
	neverSent: appt.neverSent
});

export const getDaysFromMillis = (milliseconds: number): number => milliseconds / 3600 / 1000 / 24;

export const normalizeCalendarEvent = (
	calendar: Calendar,
	appt: Appointment,
	inst: InstanceReference,
	isShared: boolean
): EventType => ({
	start: appt.allDay ? moment(inst.s).startOf('day') : new Date(inst.s),
	end: appt.allDay
		? moment(appt.inst[0].ridZ)
				.add(getDaysFromMillis(appt.dur) - 1, 'days')
				.endOf('day')
		: new Date(inst.s + ((inst as ExceptionReference).dur ?? appt.dur)),
	resource: normalizeEventResource(appt, inst as ExceptionReference, calendar),

	title: inst?.name ?? appt?.name ?? '',
	allDay: appt.allDay,
	permission: !isShared,
	id: `${appt.id}:${inst.ridZ}`,
	haveWriteAccess: calendar.haveWriteAccess ?? false
});

export const normalizeCalendarEvents = (
	appts: Array<Appointment>,
	calendars: Record<string, Calendar>
): Array<EventType> =>
	!isEmpty(appts)
		? reduce(
				appts,
				(acc, appt) => {
					const isShared = appt?.l?.includes(':');
					const cal = isShared
						? find(calendars, (f) => `${f.zid}:${f.rid}` === appt.l)
						: find(calendars, (f) => f.id === appt.l);
					return cal
						? [
								...acc,
								...map(appt.inst, (inst) => normalizeCalendarEvent(cal, appt, inst, isShared))
						  ]
						: acc;
				},
				[] as Array<EventType>
		  )
		: [];
