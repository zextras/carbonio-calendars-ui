/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TFunction } from 'i18next';
import { Dispatch } from 'redux';
import { ZimbraColorType } from '../commons/zimbra-standard-colors';

export type AppointmentReminderProps = {
	t: TFunction;
	appointments: Record<string, unknown>;
	dispatch: Dispatch;
};

export type ApptReminderModalProps = {
	title: string;
	open: boolean;
	onClose: () => void;
	events: Array<EventType>;
	t: TFunction;
	dispatch: Dispatch;
	onConfirm: (a: string) => void;
	removeReminder: (a: string) => void;
	toggleModal: () => void;
	setActive: (a: EventType) => void;
};

export type ApptReminderCardProps = {
	event: EventType;
	t: TFunction;
	dispatch: Dispatch;
	removeReminder: (a: string) => void;
	toggleModal: () => void;
	setActive: (a: EventType) => void;
};

export type SetNewTimeModalProps = {
	toggleModal: () => void;
	t: TFunction;
	setNewTime: () => void;
};

export type EventType = {
	title: string;
	allDay: boolean;
	start: number;
	end: number;
	resource: ResourceType;
	permission: boolean;
};

export type AlarmType = {
	alarm: [];
	alarmInstStart: number;
	before: number;
	compNum: number;
	inviteId: number;
	loc: string;
	name: string;
	nextAlarm: number;
	nextCalAlarm: number;
};

export type ResourceType = {
	iAmOrganizer: boolean;
	isException: boolean;
	start: number;
	id: string;
	uid: string;
	idx: number;
	calendarId: string;
	calendarColor: unknown;
	calendarName: string;
	inviteId: string;
	status: string;
	location: string;
	locationUrl: string;
	fragment: string;
	neverSent: boolean;
	isPrivate: boolean;
	class: string;
	organizer: unknown;
	freeBusy: boolean;
	role: string;
	hasChangesNotNotified: boolean;
	changesNotNotified: boolean;
	inviteNeverSent: boolean;
	hasOtherAttendees: boolean;
	hasAlarm: boolean;
	alarmData: Array<AlarmType>;
	ridZ: string;
	isRecurrent: boolean;
	participationStatus: string;
	alarm: boolean;
	calendar: {
		id: string;
		name: string;
		color: ZimbraColorType;
		owner: string | undefined;
	};
};
