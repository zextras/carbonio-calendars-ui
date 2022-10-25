/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, find, isNil, map, omitBy } from 'lodash';
import moment, { Moment } from 'moment';
import { extractBody, extractHtmlBody } from '../commons/body-message-renderer';
import { PREFS_DEFAULTS } from '../constants';
import { CRB_XPARAMS, CRB_XPROPS } from '../constants/xprops';
import { store } from '../store/redux';
import { Editor, IdentityItem } from '../types/editor';
import { Invite } from '../types/store/invite';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getVirtualRoom = (xprop: any): { label: string; link: string } | undefined => {
	const room = find(xprop, ['name', CRB_XPROPS.MEETING_ROOM]);
	if (room) {
		return {
			label: find(room.xparam, ['name', CRB_XPARAMS.ROOM_NAME])?.value,
			link: find(room.xparam, ['name', CRB_XPARAMS.ROOM_LINK])?.value
		};
	}

	return undefined;
};

export const normaliseContact = (contact: { address: string; fullName: string }): IdentityItem => ({
	...contact,
	address: contact?.address,
	fullName: contact?.fullName,
	label: contact?.address ?? contact?.fullName,
	value: contact?.address
});

const getAttendees = (attendees: any[], role: string): any[] =>
	map(filter(attendees, ['role', role]), (at) =>
		omitBy(
			{
				company: undefined,
				email: at?.a,
				firstName: undefined,
				fullName: at?.d,
				id: `${at?.a} ${at.d}`,
				label: at?.d,
				lastName: undefined
			},
			isNil
		)
	);

export type EventPropType = {
	resource: {
		ridZ?: string;
		calendar: { id: string };
		isRecurrent: boolean;
		isException?: boolean;
		location: string;
		inviteId: string;
		id: string;
	};
	title: string;
	allDay: boolean;
	start: Date | Moment;
	end: Date | Moment;
};

export const normalizeEditor = ({
	invite,
	event,
	id,
	isInstance
}: {
	id: string;
	invite?: Invite;
	event?: EventPropType;
	isInstance?: boolean;
}): Editor =>
	invite && event
		? (omitBy(
				{
					calendar:
						store?.getState().calendars.calendars[
							event.resource.calendar.id ?? PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
						],
					id,
					ridZ: event?.resource?.ridZ,
					attach: invite.attach,
					parts: invite.parts,
					attachmentFiles: invite.attachmentFiles,
					isInstance: isInstance ?? !!event?.resource?.ridZ,
					isSeries: event?.resource?.isRecurrent,
					isException: event?.resource?.isException,
					exceptId: invite?.exceptId,
					title: event?.title,
					location: event?.resource?.location,
					room: getVirtualRoom(invite.xprop),
					attendees: getAttendees(invite.attendees, 'REQ'),
					optionalAttendees: getAttendees(invite.attendees, 'OPT'),
					allDay: event?.allDay,
					freeBusy: invite.freeBusy,
					class: invite.class,
					start: event?.allDay
						? moment(event?.start)?.startOf('date').valueOf()
						: moment(event?.start).valueOf(),
					end: event?.allDay
						? moment(event?.end)?.endOf('date').valueOf()
						: moment(event?.end).valueOf(),
					timezone: invite?.start?.tz,
					inviteId: event?.resource?.inviteId,
					reminder: invite?.alarmValue,
					recur: invite.recurrenceRule,
					organizer: invite?.organizer,
					richText: extractHtmlBody(invite?.htmlDescription?.[0]?._content) ?? '',
					plainText: extractBody(invite?.textDescription?.[0]?._content) ?? '',
					uid: invite?.uid,
					ms: invite?.ms,
					rev: invite?.rev
				},
				isNil
		  ) as Editor)
		: ({ id } as Editor);
