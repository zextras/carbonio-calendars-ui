/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment from 'moment';

import { ZimbraColorType } from '../commons/zimbra-standard-colors';

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

export type EventResource = {
	attach: { mp?: []; aid?: [] };
	attachmentFiles?: [];
	id: string;
	inviteId: string;
	ridZ: string;
	calendar: {
		id: string;
		name: string;
		color: ZimbraColorType;
		owner: string | undefined;
	};
	flags: string;
	iAmOrganizer: boolean;
	iAmVisitor: boolean;
	iAmAttendee: boolean;
	isRecurrent: boolean;
	isException?: boolean;
	isPrivate?: boolean;
	status: string;
	location: string;
	locationUrl: string;
	fragment: string;
	neverSent: boolean;
	class: string;
	freeBusy: string;
	hasChangesNotNotified: boolean;
	inviteNeverSent: boolean;
	hasOtherAttendees: boolean;

	participationStatus: string;
	organizer: {
		name: string;
		email: string;
	};

	start?: DateType;
	uid?: string;
	idx?: number;
	changesNotNotified?: boolean;
	hasAlarm?: boolean;
	alarmData: Array<AlarmType>;
	alarm?: boolean;
	tags: string[];
};

export type DateType = moment.Moment | Date | number;

export type EventType = {
	title: string | undefined;
	allDay: boolean;
	start: moment.Moment | Date;
	end: moment.Moment | Date;
	resource: EventResource;
	permission: boolean;
	id?: string;
	haveWriteAccess?: boolean;
};
