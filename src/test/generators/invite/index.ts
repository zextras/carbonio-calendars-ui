/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import moment from 'moment';

import { PARTICIPANT_ROLE } from '../../../constants/api';
import { getAlarmToString } from '../../../normalizations/normalizations-utils';
import { EventResource, EventResourceCalendar, EventType } from '../../../types/event';
import { Invite, ParticipationStatus } from '../../../types/store/invite';

type CalendarProps = { calendar: Partial<EventResourceCalendar> };
type ResourceProps = {
	resource: Partial<Omit<Partial<EventResource>, 'calendar'> & CalendarProps>;
};
type GetEventProps = Omit<Partial<EventType>, 'resource'> & ResourceProps;

type GetInviteProps = { context?: Partial<Invite>; event?: GetEventProps };

const getDefaultInvite = (event?: GetEventProps): Invite => {
	const folderId = event?.resource?.calendar?.id ?? 'folderId';
	const alarmStringValue = event?.resource?.alarmData;
	const attendeeFirstName = faker.person.firstName();
	const attendeeLastName = faker.person.lastName();
	const attendeeFullName = faker.person.fullName({
		firstName: attendeeFirstName,
		lastName: attendeeLastName
	});

	const attendeeEmail = faker.internet.email({
		firstName: attendeeFirstName,
		lastName: attendeeLastName
	});

	const attendee =
		event?.resource?.iAmAttendee ?? event?.resource?.hasOtherAttendees
			? ({
					a: attendeeEmail,
					d: attendeeFullName,
					cutype: '',
					ptst: 'AC',
					role: PARTICIPANT_ROLE.REQUIRED,
					rsvp: true,
					url: attendeeEmail
				} as const)
			: undefined;
	return {
		apptId: event?.resource?.id ?? 'apptId',
		id: event?.resource?.inviteId ?? 'id',
		ciFolder: folderId,
		attendees: attendee ? [attendee] : [],
		parent: folderId,
		flags: event?.resource?.flags ?? '',
		parts: [], // event doesn't have this
		alarmValue: event?.resource?.alarmData?.[0]?.trigger?.[0]?.rel?.[0]?.m?.toString(),
		alarmString: getAlarmToString(alarmStringValue) ?? 'never',
		class: event?.resource?.class ?? 'PUB',
		compNum: event?.resource?.compNum ?? 0,
		date: 1667382630000,
		textDescription: [{ _content: '' }], // event doesn't have this
		htmlDescription: [{ _content: '' }], // event doesn't have this
		end: {
			d: moment(event?.end).utc().format('YYYYMMDD[T]HHmmss[Z]'),
			u: event?.end?.valueOf() ?? 1667382630000
		},
		freeBusy: event?.resource?.freeBusy ?? 'B',
		freeBusyActualStatus: event?.resource?.freeBusy ?? 'B',
		fragment: event?.resource?.fragment ?? '',
		isOrganizer: event?.resource?.iAmOrganizer ?? true,
		location: event?.resource?.location ?? '',
		name: event?.resource?.name ?? '',
		noBlob: true,
		organizer: {
			a: event?.resource?.organizer?.email ?? 'asd',
			d: event?.resource?.organizer?.name ?? 'lol',
			url: event?.resource?.organizer?.email ?? 'url'
		},
		recurrenceRule: undefined,
		isRespRequested: false,
		start: {
			d: moment(event?.start).utc().format('YYYYMMDD[T]HHmmss[Z]'),
			u: event?.start?.valueOf() ?? 1667382630000
		},
		sequenceNumber: 123456789,
		status: event?.resource?.status ?? 'COMP',
		transparency: 'O',
		uid: event?.resource?.uid ?? '',
		url: '',
		isException: event?.resource?.isException ?? false,
		exceptId: event?.resource?.isException
			? [
					{
						d: 'string',
						tz: 'string',
						rangeType: 1
					}
				]
			: undefined,
		tagNamesList: '',
		tags: event?.resource?.tags ?? [],
		attach: {
			mp: []
		},
		attachmentFiles: [],
		participants: attendee
			? {
					AC: [
						{
							email: attendee.a,
							isOptional: attendee.role !== PARTICIPANT_ROLE.REQUIRED,
							name: attendeeFullName,
							response: attendee.ptst as ParticipationStatus
						}
					]
				}
			: {},
		alarm: event?.resource?.alarm ?? true,
		alarmData: event?.resource?.alarmData,
		ms: 1,
		rev: 1,
		meta: [{}],
		allDay: event?.allDay ?? false,
		xprop: undefined,
		neverSent: event?.resource?.inviteNeverSent ?? false,
		locationUrl: event?.resource?.locationUrl ?? ''
	};
};

export default (props?: GetInviteProps): Invite => {
	const baseInvite = getDefaultInvite(props?.event);
	return {
		...baseInvite,
		...(props?.context ?? {})
	};
};
