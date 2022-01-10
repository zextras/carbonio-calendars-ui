/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AlarmType } from './appointments';

export type EventResource = {
	attach: { mp?: []; aid?: [] };
	attachmentFiles?: [];
	id: string;
	inviteId: string;
	ridZ: string;
	calendar: {
		id: string;
		name: string;
		color: unknown;
		owner: string | undefined;
	};
	flags: string;
	iAmOrganizer: boolean;
	iAmVisitor: boolean;
	iAmAttendee: boolean;
	status: string;
	location: string;
	fragment: string;
	neverSent: boolean;
	class: string;
	freeBusy: string;
	hasChangesNotNotified: boolean;
	inviteNeverSent: boolean;
	hasOtherAttendees: boolean;
	isRecurrent: boolean;
	participationStatus: string;
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
};

export type EventType = {
	disabled: boolean;
	start: string;
	end: string;
	resource: EventResource;
	title: string;
	ridZ: string;
	inviteId: string;
	id: string;
	calId: string;
};
