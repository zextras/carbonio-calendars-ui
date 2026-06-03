/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MutableRefObject } from 'react';

import type { View } from 'react-big-calendar';

import { AppState, SetRange, useAppStatusStore } from './store';

export const useCalendarView = (): View | undefined =>
	useAppStatusStore((s: AppState) => s.calendarView);
export const useCalendarDate = (): Date => useAppStatusStore((s: AppState) => s.date);
export const useSummaryView = (): string | undefined =>
	useAppStatusStore((s: AppState) => s.summaryViewId);
export const useIsSummaryViewOpen = (): boolean =>
	useAppStatusStore((s: AppState) => !!s.summaryViewId);
export const useSummaryViewRef = (): MutableRefObject<HTMLDivElement | null> =>
	useAppStatusStore((s: AppState) => s.summaryViewRef);
// range hooks
export const useSetRange = (): SetRange => useAppStatusStore((s: AppState) => s.setRange);
export const useRangeStart = (): number => useAppStatusStore((s: AppState) => s.range.start);
export const useRangeEnd = (): number => useAppStatusStore((s: AppState) => s.range.end);
