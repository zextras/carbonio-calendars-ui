/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserAccount } from '@zextras/carbonio-shell-ui';
import { find, reduce, map, isEmpty, some } from 'lodash';
import moment from 'moment';

import { setCalendarColor } from './normalizations-utils';
import { Folder, LinkFolder } from '../carbonio-ui-commons/types/folder';
import { EventResource, EventType } from '../types/event';
import { Appointment, ExceptionReference, InstanceReference } from '../types/store/appointments';
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
	invite,
	iAmOrganizer
}: {
	appt: Appointment;
	calendar: Folder;
	inst?: ExceptionReference;
	invite?: Invite;
	iAmOrganizer: boolean;
}): EventResource => ({
	id: appt.id,
	inviteId: inst?.inviteId ?? appt.inviteId,
	ridZ: inst?.ridZ,
	name: inst?.name ?? appt.name,
	calendar: {
		id: calendar.id,
		name: calendar.name,
		color: setCalendarColor({ color: calendar.color, rgb: calendar?.rgb }),
		owner: (calendar as LinkFolder)?.owner
	},
	flags: appt.flags,
	dur: inst?.dur ?? appt.dur,
	iAmOrganizer,
	iAmVisitor: !!(!iAmOrganizer && (calendar as LinkFolder)?.owner) ?? false, // todo: unused, can be removed
	iAmAttendee: (!iAmOrganizer && !(calendar as LinkFolder)?.owner) ?? false,
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
	alarm: appt.alarm,
	alarmData: invite?.alarmData ?? appt?.alarmData?.[0]?.alarm,
	uid: appt.uid,
	tags: appt.tags ?? [],
	neverSent: inst?.neverSent ?? appt.neverSent,
	isRespRequested: (inst?.ptst ?? appt.ptst) === 'NE' ?? false
});

export const normalizeCalendarEvent = ({
	calendar,
	appointment,
	instance,
	invite
}: {
	calendar: Folder;
	appointment: Appointment;
	instance?: InstanceReference;
	invite?: Invite;
}): EventType => {
	const allDay = (instance as ExceptionReference)?.allDay ?? appointment?.allDay;
	const instanceStart = instance
		? (instance as ExceptionReference).s + ((instance as ExceptionReference)?.tzo ?? 0)
		: undefined;
	const start = instanceStart || (invite as Invite)?.start?.u || appointment.inst?.[0]?.s;
	const dur = (instance as ExceptionReference)?.dur ?? appointment.dur;
	const user = getUserAccount();

	// It is my account/alias/identity
	const itIsMe = !!find(
		user.identities.identity,
		({ name, _attrs }) =>
			name === appointment?.or?.a || _attrs?.zimbraPrefFromAddress === appointment?.or?.a
	);
	// It is not my calendar but I saved/sent it
	const sentByMe = some(
		user.identities.identity,
		({ name, _attrs }) =>
			name === appointment?.or?.sentBy || _attrs?.zimbraPrefFromAddress === appointment?.or?.sentBy
	);
	/*

	// if sentBy it is not my personal account/alias/identity
	const itIsNotMyCalendar = !itIsMe && sentByMe;

	const iAmOrganizer = itIsNotMyCalendar ? itIsMe && sentByMe : sentByMe || itIsMe || false; */

	// if (instance?.ridZ === '20230724T170000Z') debugger;
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
			iAmOrganizer: itIsMe,
			calendar,
			inst: instance as ExceptionReference,
			invite
		}),
		title: instance?.name ?? appointment?.name ?? '',
		allDay,
		id: `${appointment.id}:${(instance as ExceptionReference)?.inviteId ?? appointment.inviteId}:${
			instance?.ridZ ?? ''
		}`,
		isShared: appointment?.l?.includes(':'),
		haveWriteAccess: calendar.perm ? /w/.test(calendar.perm) : true,
		sentByMe
	};
};

export const normalizeCalendarEvents = (
	appts: Array<Appointment>,
	calendars: Record<string, Folder>
): Array<EventType> =>
	!isEmpty(appts)
		? reduce(
				appts,
				(acc, appt) => {
					const isShared = appt?.l?.includes(':');
					const cal = isShared
						? find(
								calendars,
								(f) =>
									`${(f as LinkFolder).zid}:${(f as LinkFolder).rid}` === appt.l || f.id === appt.l
						  )
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
