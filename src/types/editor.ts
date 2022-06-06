/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Moment } from 'moment';
import { Calendar } from './store/calendars';

export type IdentityItem = {
	value: number;
	label: string;
	address: string;
	fullName: string;
	type: string;
	identityName: string;
};

export type Room = {
	label: string;
	link: string;
	attendees: any;
};

export type EditorCallbacks = {
	onOrganizerChange: (data: IdentityItem) => void;
	onSubjectChange: (data: string) => void;
	onLocationChange: (data: string) => void;
	onRoomChange: (data: Room) => void;
	onAttendeesChange: (data: string) => void;
	onOptionalAttendeesChange: (data: string) => void;
	onDisplayStatusChange: (data: string) => void;
	onCalendarChange: (data: Calendar | undefined) => void;
	onPrivateChange: (data: boolean) => void;
	onDateChange: (data: any) => void;
	onTextChange: (data: string) => void;
	onAllDayChange: (allDay: boolean, start?: number, end?: number) => void;
};

export type EditorProps = {
	editorId: string;
	callbacks: EditorCallbacks;
};
