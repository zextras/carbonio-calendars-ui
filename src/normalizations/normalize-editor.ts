/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, find, isNil, map, omitBy } from 'lodash';
import moment, { Moment } from 'moment';

import { getRoot } from '../carbonio-ui-commons/store/zustand/folder';
import { LinkFolder } from '../carbonio-ui-commons/types/folder';
import { getPrefs } from '../carbonio-ui-commons/utils/get-prefs';
import { extractBody, extractHtmlBody } from '../commons/body-message-renderer';
import { CALENDAR_RESOURCES, PREFS_DEFAULTS } from '../constants';
import { PARTICIPANT_ROLE } from '../constants/api';
import { CRB_XPARAMS, CRB_XPROPS } from '../constants/xprops';
import { CalendarEditor, Editor } from '../types/editor';
import { DateType } from '../types/event';
import { Attendee, Invite } from '../types/store/invite';

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

export const getMeetingRooms = (
	attendees: Array<Attendee>
): Array<{ email: string; label: string }> | undefined => {
	const rooms = filter(attendees, ['cutype', CALENDAR_RESOURCES.ROOM]);
	return rooms.length
		? map(rooms, (at) => ({
				label: at.d,
				email: at.a
			}))
		: undefined;
};

export const getEquipments = (
	attendees: Array<Attendee>
): Array<{ email: string; label: string }> | undefined => {
	const equipments = filter(attendees, ['cutype', CALENDAR_RESOURCES.RESOURCE]);
	return equipments.length
		? map(equipments, (at) => ({
				label: at.d,
				email: at.a
			}))
		: undefined;
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
				lastName: undefined,
				isGroup: at.isGroup,
				exp: at.exp
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

export const getLocalTime = (
	date: number | DateType,
	timezone?: string,
	localTimezone?: string
): number => {
	const dateValueOf = moment(date).valueOf();

	if (timezone) {
		const dateInTimezone = moment(date).tz(timezone);
		const localOffset = localTimezone
			? moment().tz(localTimezone).utcOffset()
			: moment().utcOffset();
		const appointmentOffset = dateInTimezone.utcOffset();
		const offSetFromUTC = appointmentOffset - localOffset;
		const offSet = offSetFromUTC * 60_000;
		return dateValueOf + offSet;
	}
	return dateValueOf;
};

export const isTimezoneDifferentFromLocal = (date: number | DateType, timezone: string): boolean =>
	moment(date).tz(timezone).utcOffset() !== moment(date).utcOffset();

const setEditorDate = ({
	editorType,
	invite,
	event
}: {
	editorType: { isSeries: boolean; isInstance: boolean; isException: boolean };
	invite: Invite | undefined;
	event: EventPropType | undefined;
}): { start: number; end: number } => {
	const { zimbraPrefCalendarDefaultApptDuration = '3600' } = getPrefs();
	const endDur = (zimbraPrefCalendarDefaultApptDuration as string)?.includes('m')
		? parseInt(zimbraPrefCalendarDefaultApptDuration as string, 10) * 60 * 1000
		: parseInt(zimbraPrefCalendarDefaultApptDuration as string, 10) * 1000;
	if (event && invite?.start && invite?.end) {
		if (editorType.isSeries && !editorType.isInstance && !editorType.isException && invite) {
			const start = invite?.start?.u ?? moment(invite?.start?.d);
			const end = invite?.end?.u ?? moment(invite?.end?.d);
			const convertedStartDate = getLocalTime(start, invite?.tz);
			const convertedEndDate = getLocalTime(end, invite?.tz);
			if (invite.tz && isTimezoneDifferentFromLocal(start, invite.tz)) {
				return {
					start: event?.allDay
						? moment(convertedStartDate)?.startOf('date').valueOf()
						: convertedStartDate,
					end: event?.allDay ? moment(convertedEndDate)?.endOf('date').valueOf() : convertedEndDate
				};
			}
			return {
				start: event?.allDay ? moment(start)?.startOf('date').valueOf() : moment(start).valueOf(),
				end: event?.allDay ? moment(end)?.endOf('date').valueOf() : moment(end).valueOf()
			};
		}
		const convertedStartDate = getLocalTime(event.start, invite?.tz);
		const convertedEndDate = getLocalTime(event.end, invite?.tz);
		return invite?.tz && isTimezoneDifferentFromLocal(event.start, invite.tz)
			? {
					start: event?.allDay
						? moment(convertedStartDate)?.startOf('date').valueOf()
						: convertedStartDate,
					end: event?.allDay ? moment(convertedEndDate)?.endOf('date').valueOf() : convertedEndDate
				}
			: {
					start: event?.allDay
						? moment(event?.start)?.startOf('date').valueOf()
						: moment(event?.start).valueOf(),
					end: event?.allDay
						? moment(event?.end)?.endOf('date').valueOf()
						: moment(event?.end).valueOf()
				};
	}
	return {
		start: moment().set('second', 0).set('millisecond', 0).valueOf(),
		end: moment().set('second', 0).set('millisecond', 0).valueOf() + endDur
	};
};

export const normalizeCalendarEditor = (folder: CalendarEditor): CalendarEditor => {
	const root = getRoot(folder.id);
	return {
		id: folder.id,
		name: folder.name,
		rgb: folder.rgb,
		color: folder.color,
		owner: folder.owner ?? (root as LinkFolder)?.owner
	};
};

export const normalizeEditor = ({
	invite,
	event,
	emptyEditor,
	context
}: {
	emptyEditor: Editor;
	invite?: Invite;
	event?: EventPropType;
	context: any;
}): Editor => {
	if (event && invite) {
		const isSeries = event?.resource?.isRecurrent;
		const isInstance = context?.isInstance ?? !!event?.resource?.ridZ;
		const isException = event?.resource?.isException ?? false;
		const calendarId = event.resource.calendar.id ?? PREFS_DEFAULTS.DEFAULT_CALENDAR_ID;
		const editorType = { isSeries, isInstance, isException };

		const { start, end } = setEditorDate({ editorType, event, invite });

		const isRichText = !(
			invite?.textDescription?.[0]?._content && !invite?.htmlDescription?.[0]?._content
		);

		const plainText = invite?.textDescription?.[0]?._content
			? extractBody(invite?.textDescription?.[0]?._content) ?? ''
			: '';

		const richText = invite?.htmlDescription?.[0]?._content
			? extractHtmlBody(invite?.htmlDescription?.[0]?._content) ?? ''
			: '';

		const folder =
			find(context?.folders, ['id', calendarId]) ??
			find(context?.folders, ['id', PREFS_DEFAULTS.DEFAULT_CALENDAR_ID]);

		const calendar = normalizeCalendarEditor(folder);

		const compiledEditor = omitBy(
			{
				calendar,
				id: emptyEditor.id,
				ridZ: event?.resource?.ridZ,
				attach: invite.attach,
				parts: invite.parts,
				attachmentFiles: invite.attachmentFiles,
				isInstance,
				isSeries,
				isException,
				exceptId: invite?.exceptId,
				title: event?.title,
				location: event?.resource?.location,
				meetingRoom: getMeetingRooms(invite.attendees),
				equipment: getEquipments(invite.attendees),
				room: getVirtualRoom(invite.xprop),
				attendees: getAttendees(invite.attendees, PARTICIPANT_ROLE.REQUIRED),
				optionalAttendees: getAttendees(invite.attendees, PARTICIPANT_ROLE.OPTIONAL),
				allDay: event?.allDay,
				freeBusy: invite.freeBusy,
				class: invite.class,
				originalStart: start,
				originalEnd: end,
				start,
				end,
				timezone: invite?.start?.tz,
				inviteId: event?.resource?.inviteId,
				reminder: invite?.alarmValue,
				recur: !isInstance ? invite.recurrenceRule : undefined,
				richText,
				plainText,
				isRichText,
				uid: invite?.uid,
				ms: invite?.ms,
				rev: invite?.rev
			},
			isNil
		);
		return {
			...emptyEditor,
			...compiledEditor
		};
	}
	return emptyEditor;
};
