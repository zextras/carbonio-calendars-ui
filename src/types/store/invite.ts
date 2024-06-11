/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ParticipantRoleType } from '../../constants/api';

// role = CHAir, REQuired, OPTional, NON-participant (ie informational)
export type ParticipationRoles = ParticipantRoleType;
export type ParticipationStatus = 'TE' | 'AC' | 'DE' | 'NE' | 'DG' | 'CO' | 'IN' | 'WE' | 'DF';
export type Attendee = {
	a: string;
	d: string;
	cutype: string;
	ptst: ParticipationStatus;
	role: ParticipationRoles;
	rsvp: boolean;
	url: string;
};

export type InviteClass = 'PUB' | 'PRI' | 'CON';
/* flags = 'u' | 'f' | 'a' | 'r' | 's' | 'w' | 'v' | 'd' | 'x' | 'n' | '!' | '?' | '+' */

export type InviteFreeBusy = 'F' | 'B' | 'T' | 'U';
export type InviteOrganizer = {
	a: string;
	d: string;
	url: string;
};

export type InviteDescription = {
	_content: string;
};

export type InviteDateFormat = {
	d: string;
	tz?: string;
	u?: number;
};

export type InviteStatus =
	| 'TENT'
	| 'CONF'
	| 'CANC'
	| 'NEED'
	| 'COMP'
	| 'INPR'
	| 'WAITING'
	| 'DEFERRED';

export type InviteTransparency = 'O' | 'T';
export type InviteException = {
	d: string;
	tz?: string;
	rangeType?: 1 | 2 | 3; // Range type - 1 means NONE, 2 means THISANDFUTURE, 3 means THISANDPRIOR
};

export type InviteParticipant = {
	name: string;
	email: string;
	isOptional: boolean;
	response: ParticipationStatus;
	cutype?: string;
};

export type InviteParticipants = Partial<{
	[k in ParticipationStatus]: Array<InviteParticipant>;
}>;

type XParam = {
	name: string;
	value: string;
};

export type XPropProps = [
	{
		name: string;
		value: string;
		xparam: Array<XParam>;
	}
];

export type AlarmDataActions =
	| 'DISPLAY'
	| 'AUDIO'
	| 'EMAIL'
	| 'PROCEDURE'
	| 'X_YAHOO_CALENDAR_ACTION_IM'
	| 'X_YAHOO_CALENDAR_ACTION_MOBILE';

type AlarmDataDescription = {
	description: string;
};

type AlarmDataTrigger = [
	{
		rel: [
			{
				s?: number;
				h?: number;
				d?: number;
				w?: number;
				m?: number;
				neg: string;
				related: 'START' | 'END';
			}
		];
	}
];

export type AlarmData = [
	{
		nextAlarm?: number;
		alarmInstStart?: number;
		action: AlarmDataActions;
		desc: AlarmDataDescription;
		trigger: AlarmDataTrigger;
	}
];

export type Part = {
	disposition?: 'attachment';
	parts?: Parts;
};

export type Parts = Array<Part>;
/* todo: invite types are definitely incomplete or can be wrong. Make sure to update this periodically */
export type Invite = {
	mp?: any;
	tz?: string;
	apptId: string;
	id: string;
	ciFolder: string;
	attendees: Array<Attendee>;
	parent: string;
	flags: string;
	parts: Parts;
	alarmValue: string | undefined;
	alarmString: string;
	class: InviteClass;
	compNum: number;
	date: number;
	textDescription: Array<InviteDescription>;
	htmlDescription: Array<InviteDescription>;
	end: InviteDateFormat;
	freeBusy: InviteFreeBusy;
	freeBusyActualStatus: InviteFreeBusy;
	fragment: string;
	isOrganizer: boolean;
	location: string;
	name: string;
	noBlob: boolean;
	organizer: InviteOrganizer;
	recurrenceRule: any;
	isRespRequested: boolean;
	start: InviteDateFormat;
	sequenceNumber: number;
	status: InviteStatus;
	transparency: InviteTransparency;
	uid: string;
	url: string;
	isException: boolean;
	exceptId?: Array<InviteException>;
	tagNamesList: string;
	tags?: string[];
	attach?: {
		mp: any;
	};
	attachmentFiles?: any;
	participants: InviteParticipants;
	alarm?: boolean;
	alarmData?: AlarmData | undefined;
	ms?: number;
	rev?: number;
	meta: any;
	allDay?: boolean;
	xprop?: XPropProps;
	neverSent: boolean;
	locationUrl: string | undefined;
};
