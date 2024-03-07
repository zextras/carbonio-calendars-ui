/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getEndTime } from '../../../commons/editor-generator';
import { EventResource, EventResourceCalendar, EventType } from '../../../types/event';
import utils from '../utils';

type CalendarProps = { calendar?: Partial<EventResourceCalendar> };

type ResourceProps = {
	resource?: Partial<Omit<Partial<EventResource>, 'calendar'> & CalendarProps>;
};

type GetEventProps = Omit<Partial<EventType>, 'resource'> & ResourceProps;

const getDefaultEvent = (): EventType => {
	const date1 = new Date();
	const date2 = new Date();

	const plus1Hours = date1.setHours(date1.getHours() + 1);
	const plus2hours = date2.setHours(date2.getHours() + 2);

	const id = `${utils.getRandomInRange({ min: 2, max: 120 })}`;
	const start = utils.getRandomInRange({ min: plus1Hours, max: plus2hours });

	const alarmInstStart = start - 10 * 60000;

	return {
		start: new Date(start),
		end: new Date(getEndTime({ start: start.valueOf(), duration: '30m' })),
		resource: {
			calendar: {
				id: '10',
				name: 'calendar',
				color: { color: '#000000', background: '#E6E9ED', label: 'black' }
			},
			organizer: {
				name: 'io',
				email: 'io@gmail.com'
			},
			alarm: true,
			alarmData: [
				{
					action: 'DISPLAY',
					alarmInstStart,
					trigger: [
						{
							rel: [
								{
									m: 5,
									neg: 'TRUE',
									related: 'START'
								}
							]
						}
					],
					desc: { description: '' }
				}
			],
			id,
			inviteId: `${id}-2`,
			name: 'name',
			hasException: false,
			ridZ: '1234',
			flags: '',
			dur: 123456789,
			iAmOrganizer: true,
			iAmVisitor: false,
			iAmAttendee: false,
			status: 'COMP',
			location: '',
			locationUrl: '',
			fragment: '',
			class: 'PUB',
			freeBusy: 'F',
			hasChangesNotNotified: false,
			inviteNeverSent: false,
			hasOtherAttendees: false,
			isRecurrent: false,
			isException: false,
			participationStatus: 'AC',
			compNum: 0,
			apptStart: 123456789,
			uid: '',
			tags: [''],
			neverSent: true,
			isRespRequested: false
		},
		title: 'new-event-1',
		allDay: false,
		id,
		isShared: false,
		haveWriteAccess: true
	};
};

export default (context = {} as GetEventProps): EventType => {
	const { calendar, organizer } = context?.resource ?? {};
	const baseEvent = getDefaultEvent();
	return {
		...baseEvent,
		...context,
		resource: {
			...baseEvent.resource,
			...context.resource,
			calendar: {
				...baseEvent.resource.calendar,
				...(calendar ?? {}),
				color: {
					...baseEvent.resource.calendar.color,
					...(calendar?.color ?? {})
				}
			},
			organizer: {
				...baseEvent.resource.organizer,
				...(organizer ?? {})
			}
		}
	};
};
