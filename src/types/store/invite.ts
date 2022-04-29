/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type Invite = {
	tz?: string;
	apptId: string;
	id: string;
	attendees: any;
	parent: string;
	flags: string;
	parts: any;
	alarmValue: string;
	alarmString: string;
	seriesId: string;
	class: string;
	compNum: number;
	date: number;
	textDescription: any;
	htmlDescription: any;
	end: any;
	freeBusy: string;
	freeBusyActualStatus: string;
	fragment: string;
	isOrganizer: boolean;
	location: string;
	name: string;
	noBlob: boolean;
	organizer: any;
	recurrenceRule: any;
	isRespRequested: boolean;
	start: any;
	sequenceNumber: number;
	status: string;
	transparency: string;
	uid: string;
	url: string;
	isException: boolean;
	recurrenceId: any;
	tagNamesList: string;
	tags?: string[];
	attach: {
		mp: any;
	};
	attachmentFiles: any;
	participants: any;
	alarm?: boolean;
	alarmData?: any | undefined;
	ms?: number;
	rev?: number;
	meta: any;
};
