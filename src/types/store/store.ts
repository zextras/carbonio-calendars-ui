/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Editor } from '../editor';
import { Appointment } from './appointments';
import { Calendar } from './calendars';
import { Invite } from './invite';

export type CalendarSlice = {
	status: string;
	calendars: Record<string, Calendar>;
	start: number;
	end: number;
};
export type AppointmentsSlice = {
	status: string;
	appointments: Record<string, Appointment>;
};
export type InvitesSlice = {
	status: string;
	invites: Record<string, Invite>;
};
export type EditorSlice = {
	status: string;
	editors: Record<string, Editor>;
	editorPanel: string | undefined;
	activeId: string | undefined;
	searchActiveId: string | undefined;
};
export type Store = {
	calendars: CalendarSlice;
	appointments: AppointmentsSlice;
	invites: InvitesSlice;
	editor: EditorSlice;
};
