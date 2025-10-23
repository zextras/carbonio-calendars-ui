/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getRoot, LinkFolder, getPrefs } from '@zextras/carbonio-ui-commons';
import { filter, find, isNil, map, omitBy } from 'lodash';
import moment, { Moment } from 'moment';

import { extractBody, extractHtmlBody } from '../commons/body-message-renderer';
import type { EditorContext } from '../commons/editor-generator';
import { CALENDAR_RESOURCES, PREFS_DEFAULTS } from '../constants';
import { PARTICIPANT_ROLE } from '../constants/api';
import { CRB_XPARAMS, CRB_XPROPS } from '../constants/xprops';
import { CalendarEditor, Editor } from '../types/editor';
import { EventType } from '../types/event';
import { Attendee, Invite } from '../types/store/invite';

// TODO: REMOVE IF RELATED TO OLD CHAT PRODUCT
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
				exp: at.exp,
				ptst: at?.ptst
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
			const start = invite?.start?.u ?? moment(invite?.start?.d).valueOf();
			const end = invite?.end?.u ?? moment(invite?.end?.d).valueOf();

			const currentStartDate = new Date(start);
			const currentEndDate = new Date(end);

			return {
				start: event?.allDay
					? moment(currentStartDate)?.startOf('date').valueOf()
					: currentStartDate.getTime(),
				end: event?.allDay
					? moment(currentEndDate)?.endOf('date').valueOf()
					: currentEndDate.getTime()
			};
		}

		const currentStartDate = new Date(moment(event?.start).valueOf());
		const currentEndDate = new Date(moment(event?.end).valueOf());

		return {
			start: event?.allDay
				? moment(currentStartDate)?.startOf('date').valueOf()
				: moment(currentStartDate).valueOf(),
			end: event?.allDay
				? moment(currentEndDate)?.endOf('date').valueOf()
				: moment(currentEndDate).valueOf()
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
	event?: EventType;
	context: EditorContext;
}): Editor => {
	if (event && invite) {
		const organizer = {
			email: event.resource.organizer?.email ?? '',
			fullName: event.resource.organizer?.name
		};
		const isSeries = event?.resource?.isRecurrent;
		const isInstance = context.isInstance ?? !!event?.resource?.ridZ;
		const isException = event?.resource?.isException ?? false;
		const calendarId = event.resource.calendar.id ?? PREFS_DEFAULTS.DEFAULT_CALENDAR_ID;
		const editorType = { isSeries, isInstance, isException };

		const { start, end } = setEditorDate({ editorType, event, invite });

		const isPlainText =
			invite?.textDescription?.[0]?._content && !invite?.htmlDescription?.[0]?._content;

		const isRichText = !isPlainText;

		const plainText = invite?.textDescription?.[0]?._content
			? (extractBody(invite?.textDescription?.[0]?._content) ?? '')
			: '';

		const richText = invite?.htmlDescription?.[0]?._content
			? (extractHtmlBody(invite?.htmlDescription?.[0]?._content) ?? '')
			: '';

		const folder =
			context.folders[calendarId] ?? context.folders[PREFS_DEFAULTS.DEFAULT_CALENDAR_ID];

		const calendar = normalizeCalendarEditor(folder);

		const compiledEditor: Partial<Editor> = omitBy(
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
				organizer,
				exceptId: invite.exceptId,
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
				timezone: invite.start?.tz,
				inviteId: event?.resource?.inviteId,
				reminder: invite.alarmValue,
				recur: !isInstance ? invite.recurrenceRule : undefined,
				richText,
				plainText,
				isRichText,
				uid: invite.uid,
				ms: invite.ms,
				rev: invite.rev,
				compNum: invite.compNum ?? 0
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
