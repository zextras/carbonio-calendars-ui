import { getEndTime } from '../../../commons/editor-generator';
import { EventResource, EventResourceCalendar, EventType } from '../../../types/event';

type CalendarProps = { calendar: Partial<EventResourceCalendar> };

type ResourceProps = {
	resource: Partial<Omit<Partial<EventResource>, 'calendar'> & CalendarProps>;
};

type GetEventProps = Omit<Partial<EventType>, 'resource'> & ResourceProps;

const getDefaultEvent = (): EventType => ({
	start: new Date(),
	end: new Date(getEndTime({ start: new Date().valueOf(), duration: '60m' })),
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
		id: '1',
		inviteId: '1-2',
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
		neverSent: true
	},
	title: 'new-event-1',
	allDay: false,
	id: '1',
	permission: true,
	haveWriteAccess: true
});

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