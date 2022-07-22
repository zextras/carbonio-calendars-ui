/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '@zextras/carbonio-shell-ui';
import { filter, find, isNil, map, omitBy } from 'lodash';
import moment, { Moment } from 'moment';
import { extractHtmlBody, extractBody } from '../commons/body-message-renderer';
import { CALENDAR_PREFS_DEFAULTS } from '../constants/defaults';
import { CRB_XPARAMS, CRB_XPROPS } from '../constants/xprops';
import { Editor } from '../types/editor';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { retrieveAttachmentsType } from './normalizations-utils';

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
	event
}: {
	invite: Invite;
	event: EventPropType;
}): Editor =>
	omitBy(
		{
			calendar:
				store?.store?.getState().calendars.calendars[
					event.resource.calendar.id ?? CALENDAR_PREFS_DEFAULTS.ZIMBRA_PREF_DEFAULT_CALENDAR_ID
				],
			ridZ: event?.resource?.ridZ,
			attach: invite.attach,
			parts: invite.parts,
			attachmentFiles: invite.attachmentFiles,
			isInstance: !!event?.resource?.ridZ,
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
			richText: extractHtmlBody(invite?.htmlDescription?.[0]?._content) ?? '',
			plainText: extractBody(invite?.textDescription?.[0]?._content) ?? ''
		},
		isNil
	) as Editor;
