/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AppState, SetRange, useAppStatusStore } from './store';

export const useCalendarView = (): string => useAppStatusStore((s: AppState) => s.calendarView);
export const useCalendarDate = (): Date => useAppStatusStore((s: AppState) => s.date);
export const useIsSummaryViewOpen = (): boolean =>
	useAppStatusStore((s: AppState) => s.summaryViewCounter > 0);

// range hooks
export const useSetRange = (): SetRange => useAppStatusStore((s: AppState) => s.setRange);
export const useRangeStart = (): number => useAppStatusStore((s: AppState) => s.range.start);
export const useRangeEnd = (): number => useAppStatusStore((s: AppState) => s.range.end);
