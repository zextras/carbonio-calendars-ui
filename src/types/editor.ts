/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EventResourceCalendar } from './event';
import { Calendar } from './store/calendars';
import { Attendee, InviteClass, InviteFreeBusy } from './store/invite';

export type IdentityItem = {
	value?: number | string;
	label: string;
	address: string;
	fullName: string;
	type?: string;
	identityName?: string;
};

export type Room = {
	label: string;
	link: string;
	attendees: any;
};

export type EditorCallbacks = {
	onToggleRichText: (isRichText: boolean) => void;
	onAttachmentsChange: (attach: any, attachmentFiles: any) => void;
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
	onDisplayStatusChange: (data: InviteFreeBusy) => void;
	onCalendarChange: (calendar: Calendar) => void;
	onPrivateChange: (data: InviteClass) => void;
	onDateChange: (date: { start: number; end: number }) => {
		payload: { id: string | undefined; start: number; end: number };
		type: string;
	};
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
	onSave: ({ draft, isNew }: { draft?: boolean; isNew?: boolean }) => Promise<any>;
	onSend: (isNew: boolean) => Promise<any>;
};

export type EditorProps = {
	editorId: string;
	callbacks: EditorCallbacks;
	expanded?: boolean;
};

export type Editor = {
	disabled: Record<string, boolean>;
	uid?: string | undefined;
	ridZ?: string | undefined;
	draft?: boolean | undefined;
	calendar: EventResourceCalendar | undefined;
	exceptId: { d: string; tz: string } | undefined;
	isException: boolean;
	isInstance: boolean;
	isSeries: boolean;
	isNew: boolean;
	isRichText?: boolean;
	attachmentFiles: any;
	plainText: string;
	richText: string;
	organizer?: any;
	title?: string;
	location?: string;
	room?: any;
	attendees: any[];
	optionalAttendees: any[];
	allDay?: boolean;
	freeBusy?: InviteFreeBusy;
	class?: string;
	start?: number;
	end?: number;
	inviteId?: string | undefined;
	timezone?: string | undefined;
	reminder?: string | undefined;
	recur?: any;
	id: string;
	panel: boolean;
	attach: any;
};
