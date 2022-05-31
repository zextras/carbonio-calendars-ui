/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Moment } from 'moment';
import { ZimbraColorType } from '../commons/zimbra-standard-colors';
import { AlarmType } from './appointments';
import { AlarmData, ParticipationStatus } from './store/invite';

export type EventResource = {
	attach?: { mp?: []; aid?: [] };
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
	isException?: boolean;
	start?: number;
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
