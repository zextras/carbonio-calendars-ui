/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find, reduce, map, isEmpty } from 'lodash';
import moment from 'moment';
import { EventType } from '../types/event';
import { Appointment, ExceptionReference, InstanceReference } from '../types/store/appointments';
import { Calendar } from '../types/store/calendars';
import { Invite } from '../types/store/invite';

export const getLocationUrl = (location: string): string | undefined => {
	const regex = /\bhttps?:\/\/\S+/g;
	const found = location?.match(regex);

	return found?.length ? found[0] : undefined;
};

export const getDaysFromMillis = (milliseconds: number): number => milliseconds / 3600 / 1000 / 24;

const normalizeEventResource = ({
	appt,
	calendar,
	inst,
	invite
}: {
	appt: Appointment;
	calendar: Calendar;
	inst?: ExceptionReference;
	invite?: Invite;
}): any => ({
	id: appt.id,
	inviteId: inst?.inviteId ?? appt.inviteId,
	ridZ: inst?.ridZ,
	name: inst?.name ?? appt.name,
	calendar: {
		id: calendar.id,
		name: calendar.name,
		color: calendar.color,
		owner: calendar.owner
	},
	flags: appt.flags,
	iAmOrganizer: inst?.isOrg ?? appt.isOrg ?? false,
	iAmVisitor: !!(!appt.isOrg && calendar.owner) ?? false,
	iAmAttendee: (!appt.isOrg && !calendar.owner) ?? false,
	status: inst?.status ?? appt.status,
	location: inst?.loc ?? appt.loc,
	locationUrl: getLocationUrl(inst?.loc ?? appt.loc ?? ''),
	fragment: (inst as ExceptionReference)?.fr ?? appt.fr,
	class: inst?.class ?? appt.class,
	freeBusy: inst?.fb ?? appt.fb,
	hasChangesNotNotified: inst?.draft ?? appt.draft ?? false,
	inviteNeverSent: appt.neverSent || false,
	hasOtherAttendees: inst?.otherAtt ?? appt.otherAtt ?? false,
	isRecurrent: inst?.recur ?? appt.recur,
	isException: inst?.ex ?? false,
	hasException: inst?.hasEx ?? appt.hasEx ?? false,
	participationStatus: inst?.ptst ?? appt.ptst,
	organizer: {
		name: appt?.or?.d,
		email: appt?.or?.a
	},
	compNum: appt.compNum,
	apptStart: inst?.s,
	alarm: inst?.alarm ?? appt.alarm,
	alarmData: invite?.alarmData ?? appt.alarmData,
	uid: appt.uid,
	tags: appt.tags ?? [],
	neverSent: inst?.neverSent ?? appt.neverSent,
	appointment: appt,
	instance: inst
});

export const normalizeCalendarEvent = ({
	calendar,
	appointment,
	instance,
	invite
}: {
	calendar: Calendar;
	appointment: Appointment;
	instance?: InstanceReference;
	invite?: Invite;
}): EventType => {
	const allDay = (instance as ExceptionReference)?.allDay ?? appointment?.allDay;
	const instanceStart = instance
		? (instance as ExceptionReference).s + ((instance as ExceptionReference)?.tzo ?? 0)
		: undefined;
	const start = instanceStart ?? (invite as Invite)?.start?.u;
	const dur = (instance as ExceptionReference)?.dur ?? appointment.dur;
	return {
		start: allDay ? new Date(moment(start).startOf('day').valueOf()) : new Date(start),
		end: allDay
			? new Date(
					moment(start)
						.add(getDaysFromMillis(dur) - 1, 'days')
						.endOf('day')
						.valueOf()
			  )
			: new Date(start + dur),
		resource: normalizeEventResource({
			appt: appointment,
			calendar,
			inst: instance as ExceptionReference,
			invite
		}),
		title: instance?.name ?? appointment?.name ?? '',
		allDay,
		id: `${appointment.id}:${(instance as ExceptionReference)?.inviteId ?? appointment.inviteId}:${
			instance?.ridZ ?? ''
		}`,
		permission: !appointment?.l?.includes(':'),
		haveWriteAccess: appointment.isOrg ?? calendar?.haveWriteAccess ?? false
	};
};

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
								...map(appt.inst, (inst) =>
									normalizeCalendarEvent({
										calendar: cal,
										appointment: appt,
										instance: inst
									})
								)
						  ]
						: acc;
				},
				[] as Array<EventType>
		  )
		: [];
