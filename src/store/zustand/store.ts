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
};

export const useAppStatusStore = create<AppState>(() => ({
	calendarView: '',
	date: new Date(),
	isSummaryViewOpen: false
})) as UseBoundStore<AppState, StoreApi<AppState>>;
