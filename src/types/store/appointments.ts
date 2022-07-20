/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line no-shadow
import { AlarmType } from '../appointments';
import { ParticipationStatus } from './invite';

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
	class?: string;
	hasEx?: boolean;
	status?: string;
	fb?: string;
	ptst?: string;
};

export type InstanceReference = SingleReference | ExceptionReference;

export type Appointment = {
	alarm?: AlarmType;
	alarmData: any;
	allDay: any;
	class: string;
	flags: string;
	compNum: number;
	d: number;
	draft: boolean;
	dur: number;
	fb: string;
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
	status: string;
	transp: string;
	uid: string;
	meta?: any;
	otherAtt?: boolean;
	tags?: string[];
};
