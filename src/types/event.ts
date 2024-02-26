/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment, { Moment } from 'moment';

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
	location: string;
	locationUrl?: string;
	fragment: string;
	neverSent: boolean;
	class: InviteClass;
	freeBusy: InviteFreeBusy;
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
	start?: DateType;
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

export type DateType = moment.Moment | Date | number;

export type EventType = {
	start: Moment | Date;
	end: Moment | Date;
	resource: EventResource;
	allDay: boolean;
	isShared: boolean;
	title: string;
	id: string;
	haveWriteAccess: boolean;
};
