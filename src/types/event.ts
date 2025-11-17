/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CalendarsColorType } from './store/calendars';
import {
	AlarmData,
	InviteClass,
	InviteFreeBusy,
	InviteStatus,
	ParticipationStatus
} from './store/invite';

export type AlarmType = {
	alarm: AlarmData;
	alarmInstStart: number;
	before?: number;
	compNum: number;
	invId: number;
	loc: string;
	name: string;
	nextAlarm: number;
	nextCalAlarm?: number;
};

export type EventResourceCalendar = {
	broken?: boolean;
	checked?: boolean;
	deletable?: boolean;
	absFolderPath?: string;
	n?: number;
	parent?: string;
	haveWriteAccess?: boolean;
	acl?: {
		grant: [
			{
				zid: string;
				gt: string;
				perm: string;
			}
		];
	};
	freeBusy?: boolean;
	appointments?: [{ ids: string }];
	id: string;
	name: string;
	color: CalendarsColorType;
	owner?: string | undefined;
	isShared?: boolean;
	perm?: string;
};

export type EventResource = {
	dur: number;
	attach?: { mp?: []; aid?: [] };
	attachmentFiles?: [];
	id: string;
	inviteId: string;
	ridZ?: string;
	calendar: EventResourceCalendar;
	flags: string;
	iAmOrganizer: boolean;
	iAmVisitor: boolean;
	iAmAttendee: boolean;
	isException?: boolean;
	isPrivate?: boolean;
	status: InviteStatus;
	l?: string;
	location: string;
	locationUrl?: string;
	fragment: string;
	neverSent: boolean;
	class: InviteClass;
	freeBusy: InviteFreeBusy;
	freeBusyActual?: InviteFreeBusy;
	hasChangesNotNotified: boolean;
	inviteNeverSent: boolean;
	hasOtherAttendees: boolean;
	isRecurrent: boolean;
	participationStatus: ParticipationStatus;
	organizer:
		| {
				name?: string;
				email?: string;
		  }
		| undefined;
	room?: any;
	start?: Date;
	uid?: string;
	idx?: number;
	changesNotNotified?: boolean;
	hasAlarm?: boolean;
	alarm?: boolean;
	tags: string[];
	compNum: number;
	apptStart?: number;
	alarmData?: AlarmData;
	name: string;
	hasException?: boolean;
	isRespRequested: boolean;
};

export type EventType = {
	start: Date;
	end: Date;
	resource: EventResource;
	resourceId: string;
	allDay: boolean;
	isShared: boolean;
	title: string;
	id: string;
	haveWriteAccess: boolean;
};
