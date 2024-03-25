/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { isNil, omitBy } from 'lodash';
import moment from 'moment';

import { ROOM_DIVIDER } from '../../../constants';
import { EventType } from '../../../types/event';
import { Appointment } from '../../../types/store/appointments';
import {
	InviteClass,
	InviteFreeBusy,
	InviteStatus,
	ParticipationStatus
} from '../../../types/store/invite';

type GetAppointmentProps = {
	event?: EventType;
	appointment?: Partial<Appointment>;
};

const getDefaultAppointment = (): Appointment => {
	const organizerFirstName = faker.person.firstName();
	const organizerLastName = faker.person.lastName();
	const organizerEmail = faker.internet.email({
		firstName: organizerFirstName,
		lastName: organizerLastName
	});

	return {
		id: faker.string.uuid(),
		class: 'PUB' as InviteClass,
		flags: '',
		alarm: false,
		fb: 'B' as InviteFreeBusy,
		fr: `${ROOM_DIVIDER} ${organizerFirstName} ${organizerLastName} have invited you to a new meeting! Subject: ...`,
		d: moment().valueOf(),
		fba: 'B' as InviteFreeBusy,
		md: 0,
		ms: 0,
		ptst: 'AC' as ParticipationStatus,
		rev: 0,
		status: 'CONF' as InviteStatus,
		transp: '',
		uid: '',
		compNum: 0,
		dur: 1800000,
		allDay: false,
		inst: [
			{
				recur: false,
				ridZ: moment().set('second', 0).set('millisecond', 0).format('YYYYMMDD[T]HHmmss[Z]'),
				s: moment().set('second', 0).set('millisecond', 0).valueOf()
			}
		],
		draft: false,
		inviteId: faker.string.uuid(),
		isOrg: true,
		or: {
			a: organizerEmail,
			d: `${organizerFirstName}  ${organizerLastName}`,
			url: organizerEmail
		},
		loc: '',
		otherAtt: false,
		recur: false,
		l: '10',
		name: faker.lorem.word(),
		neverSent: false,
		s: 0,
		tags: []
	};
};

export default (context: GetAppointmentProps | undefined = {}): Appointment => {
	const baseEvent = getDefaultAppointment();
	const { event } = context;
	return event
		? {
				...baseEvent,
				...omitBy(
					{
						id: event?.resource?.id,
						inviteId: event?.resource?.inviteId,
						isOrg: event?.resource?.iAmOrganizer,
						loc: event?.resource?.location,
						l: event?.resource?.calendar.id,
						name: event?.title,
						dur: event.resource.dur,
						inst: event.resource.start
							? [
									{
										recur: false,
										ridZ: moment(event.resource.start).format('YYYYMMDD[T]HHmmss[Z]'),
										s: moment(event.resource.start).valueOf()
									}
								]
							: undefined,
						or:
							event?.resource?.organizer?.email && event?.resource?.organizer?.name
								? {
										a: event.resource.organizer.email,
										d: event.resource.organizer.name,
										url: event.resource.organizer.email
									}
								: undefined
					},
					isNil
				),
				...(context?.appointment ?? {})
			}
		: {
				...baseEvent,
				...(context?.appointment ?? {})
			};
};
