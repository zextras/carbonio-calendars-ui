/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AppState, useAppStatusStore } from './store';

export const useCalendarView = (): string => useAppStatusStore((s: AppState) => s.calendarView);
export const useCalendarDate = (): Date => useAppStatusStore((s: AppState) => s.date);
export const useIsSummaryViewOpen = (): boolean =>
	useAppStatusStore((s: AppState) => s.summaryViewCounter > 0);
