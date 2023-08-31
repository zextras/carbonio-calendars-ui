/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EventResourceCalendar } from './event';
import { Calendar } from './store/calendars';
import { Attendee, InviteClass, InviteFreeBusy } from './store/invite';

export type Count = { count: { num: number } };
export type Until = {
	until: {
		d: string;
	};
};

export type Interval = { ival: number };
export type Byday = { wkday: Array<{ day: string }> };
export type PosList = { poslist: string };
export type ModayList = { modaylist: number };
export type ByMonth = { molist: string };

export type RecurrenceEndValue = Count | Until | undefined;
export type RecurrenceStartValue = {
	bymonth?: ByMonth;
	bymonthday?: ModayList;
	bysetpos?: PosList;
	interval?: Interval;
	byday?: Byday;
};

export type IdentityItem = {
	value: string;
	label: string;
	address?: string;
	fullName?: string;
	type?: string;
	identityName?: string;
};

export type Room = {
	label: string;
	link: string;
	attendees: any;
};

export type EditorProps = {
	editorId: string;
	expanded?: boolean;
};

type DisabledField =
	| 'title'
	| 'location'
	| 'organizer'
	| 'virtualRoom'
	| 'richTextButton'
	| 'attachmentsButton'
	| 'saveButton'
	| 'sendButton'
	| 'freeBusySelector'
	| 'calendarSelector'
	| 'attendees'
	| 'optionalAttendees'
	| 'datePicker'
	| 'timezone'
	| 'attachments'
	| 'freeBusy'
	| 'calendar'
	| 'private'
	| 'allDay'
	| 'reminder'
	| 'recurrence'
	| 'composer';

export type Editor = {
	disabled: Partial<{
		[k in DisabledField]: boolean;
	}>;
	uid?: string | undefined;
	ridZ?: string | undefined;
	draft?: boolean | undefined;
	calendar?: Partial<EventResourceCalendar>;
	exceptId?: { d: string; tz: string } | undefined;
	isException: boolean;
	isInstance: boolean;
	isSeries: boolean;
	isNew: boolean;
	isRichText?: boolean;
	attachmentFiles: any;
	plainText: string;
	richText: string;
	organizer?: any;
	sender?: any;
	title?: string;
	location?: string;
	room?: {
		label: string;
		link: string;
	};
	attendees: any[];
	optionalAttendees: any[];
	allDay?: boolean;
	freeBusy?: InviteFreeBusy;
	class?: InviteClass;
	start?: number;
	end?: number;
	inviteId?: string | undefined;
	timezone?: string | undefined;
	reminder?: string | undefined;
	recur?: any;
	id: string;
	searchPanel?: boolean;
	panel: boolean;
	attach?: any;
	isProposeNewTime?: boolean;
};
