/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, find, isNil, map, omit, omitBy } from 'lodash';
import moment, { Moment } from 'moment';
import { extractBody, extractHtmlBody } from '../commons/body-message-renderer';
import { PREFS_DEFAULTS } from '../constants';
import { CRB_XPARAMS, CRB_XPROPS } from '../constants/xprops';
import { Editor } from '../types/editor';
import { Invite } from '../types/store/invite';
import { getPrefs } from '../carbonio-ui-commons/utils/get-prefs';

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
	if (event) {
		if (editorType.isSeries && !editorType.isInstance && !editorType.isException && invite) {
			return {
				start: event?.allDay
					? moment(invite?.start?.u)?.startOf('date').valueOf()
					: moment(invite?.start?.u).valueOf(),
				end: event?.allDay
					? moment(invite?.end?.u)?.endOf('date').valueOf()
					: moment(invite?.end?.u).valueOf()
			};
		}
		return {
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
		const compiledEditor = omitBy(
			{
				calendar: omit(find(context?.folders, ['id', calendarId]), 'parent'),
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
				room: getVirtualRoom(invite.xprop),
				attendees: getAttendees(invite.attendees, 'REQ'),
				optionalAttendees: getAttendees(invite.attendees, 'OPT'),
				allDay: event?.allDay,
				freeBusy: invite.freeBusy,
				class: invite.class,
				start,
				end,
				timezone: invite?.start?.tz,
				inviteId: event?.resource?.inviteId,
				reminder: invite?.alarmValue,
				recur: !isInstance ? invite.recurrenceRule : undefined,
				richText: extractHtmlBody(invite?.htmlDescription?.[0]?._content) ?? '',
				plainText: extractBody(invite?.textDescription?.[0]?._content) ?? '',
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
