/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment, { Moment } from 'moment';
import { ZimbraColorType } from '../commons/zimbra-standard-colors';
import { AlarmData, ParticipationStatus } from './store/invite';

export type AlarmType = {
	alarm: [];
	alarmInstStart: DateType;
	before: number;
	compNum: number;
	inviteId: number;
	loc: string;
	name: string;
	nextAlarm: DateType;
	nextCalAlarm: DateType;
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
	color: ZimbraColorType;
	owner?: string | undefined;
	isShared?: boolean;
};

export type EventResource = {
	dur: number;
	attach?: { mp?: []; aid?: [] };
	attachmentFiles?: [];
	id: string;
	inviteId: string;
	ridZ: string;
	calendar: EventResourceCalendar;
	flags: string;
	iAmOrganizer: boolean;
	iAmVisitor: boolean;
	iAmAttendee: boolean;
	isException?: boolean;
	isPrivate?: boolean;
	status: string;
	location: string;
	locationUrl?: string;
	fragment: string;
	neverSent: boolean;
	class: string;
	freeBusy: string;
	hasChangesNotNotified: boolean;
	inviteNeverSent: boolean;
	hasOtherAttendees: boolean;
	isRecurrent: boolean;
	participationStatus: ParticipationStatus;
	organizer: {
		name: string;
		email: string;
	};
	room?: any;
	start?: DateType;
	uid?: string;
	idx?: number;
	changesNotNotified?: boolean;
	hasAlarm?: boolean;
	alarm?: AlarmType;
	tags: string[];
	compNum: number;
	apptStart: number;
	alarmData: AlarmData;
};

export type DateType = moment.Moment | Date | number;

export type EventType = {
	start: Moment | Date;
	end: Moment | Date;
	resource: EventResource;
	allDay: boolean;
	permission: boolean;
	title: string;
	id: string;
	haveWriteAccess: boolean;
};
