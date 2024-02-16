/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { InviteClass, InviteFreeBusy, InviteStatus, ParticipationStatus } from './invite';
import { AlarmType } from '../event';

export type SingleReference = {
	recur: boolean;
	ridZ: string;
	s: number;
	name?: string;
};

export type ExceptionReference = SingleReference & {
	alarm: boolean;
	allDay: boolean;
	dur: number;
	draft: boolean;
	inviteId: string;
	isOrg: boolean;
	name: string;
	neverSent: boolean;
	ex: boolean;
	fr: string;
	recur: boolean;
	or: any;
	loc: string | undefined;
	otherAtt: any;
	class?: InviteClass;
	hasEx?: boolean;
	status?: InviteStatus;
	fb?: InviteFreeBusy;
	ptst?: ParticipationStatus;
	tzo?: number;
};

export type InstanceReference = SingleReference | ExceptionReference;

export type Appointment = {
	alarm: boolean;
	alarmData?: Array<AlarmType>;
	allDay: boolean;
	class: InviteClass;
	flags: string;
	compNum: number;
	d: number;
	draft: boolean;
	dur: number;
	fb: InviteFreeBusy;
	fba: string;
	fr?: string;
	hasEx?: boolean;
	id: string;
	inst: Array<InstanceReference>;
	inviteId: string;
	isOrg: boolean;
	l: string;
	loc: string;
	md: number;
	ms: number;
	name: string;
	neverSent: boolean;
	or: any;
	ptst: ParticipationStatus;
	recur?: any;
	rev: number;
	s: any;
	status: InviteStatus;
	transp: string;
	uid: string;
	meta?: any;
	otherAtt?: boolean;
	tags?: string[];
};
