/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import create, { StoreApi, UseBoundStore } from 'zustand';

export type AppState = {
	calendarView: string;
	date: Date;
	isSummaryViewOpen: boolean;
	appointmentId: string | undefined;
	calendarId: string | undefined;
	ridZ: string | undefined;
	inviteId: string | undefined;
};

export const useAppStatusStore = create<AppState>(() => ({
	calendarView: '',
	date: new Date(),
	isSummaryViewOpen: false,
	appointmentId: undefined,
	calendarId: undefined,
	ridZ: undefined,
	inviteId: undefined
})) as UseBoundStore<AppState, StoreApi<AppState>>;
