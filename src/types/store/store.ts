/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Appointment } from './appointments';
import { Calendar } from './calendars';

export type CalendarMsg = any;
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
	invites: Record<string, CalendarMsg>;
};
export type EditorSlice = {
	status: string;
	editors: any;
	editorPanel: string | null;
};
export type Store = {
	calendars: CalendarSlice;
	appointments: AppointmentsSlice;
	invites: InvitesSlice;
	editor: EditorSlice;
};
