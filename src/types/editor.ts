/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Calendar } from './store/calendars';
import { Attendee, InviteClass } from './store/invite';

export type IdentityItem = {
	value: number;
	label: string;
	address: string;
	fullName: string;
	type: string;
	identityName: string;
};

export type Room = {
	label: string;
	link: string;
	attendees: any;
};

export type EditorCallbacks = {
	onOrganizerChange: (data: IdentityItem) => void;
	onSubjectChange: (data: string) => void;
	onLocationChange: (data: string) => void;
	onRoomChange: (data: Room) => void;
	onAttendeesChange: (attendees: Array<Attendee>) => {
		payload: { id: string; attendees: Attendee[] };
		type: string;
	};
	onOptionalAttendeesChange: (optionalAttendees: Array<Attendee>) => {
		payload: { id: string; optionalAttendees: Array<Attendee> };
		type: string;
	};
	onDisplayStatusChange: (data: string) => void;
	onCalendarChange: (calendar: Calendar) => void;
	onPrivateChange: (data: InviteClass) => void;
	onDateChange: (data: any) => void;
	onTextChange: ([plainText, richText]: [plainText: string, richText: string]) => {
		payload: { id: string | undefined; richText: string; plainText: string };
	};
	onAllDayChange: (
		allDay: boolean,
		start?: number,
		end?: number
	) => {
		payload: {
			id: string | undefined;
			allDay: boolean;
			start?: number | undefined;
			end?: number | undefined;
		};
		type: string;
	};
	onTimeZoneChange: (timezone: string) => void;
	onReminderChange: (reminder: string) => void;
	onRecurrenceChange: (recurrenceRule: any) => void;
	closeCurrentEditor: () => void;
};

export type EditorProps = {
	editorId: string;
	callbacks: EditorCallbacks;
	expanded?: boolean;
};
