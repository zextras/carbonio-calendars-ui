/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AppState, SetRange, useAppStatusStore } from './store';
import { Resource } from '../../types/editor';

export const useCalendarView = (): string => useAppStatusStore((s: AppState) => s.calendarView);
export const useCalendarDate = (): Date => useAppStatusStore((s: AppState) => s.date);
export const useSummaryView = (): string | undefined =>
	useAppStatusStore((s: AppState) => s.summaryViewId);
export const useMeetingRooms = (): Array<Resource> | undefined =>
	useAppStatusStore((s: AppState) => s.meetingRoom);

export const useEquipments = (): Array<Resource> | undefined =>
	useAppStatusStore((s: AppState) => s.equipment);

export const useIsSummaryViewOpen = (): boolean =>
	useAppStatusStore((s: AppState) => !!s.summaryViewId);

// range hooks
export const useSetRange = (): SetRange => useAppStatusStore((s: AppState) => s.setRange);
export const useRangeStart = (): number => useAppStatusStore((s: AppState) => s.range.start);
export const useRangeEnd = (): number => useAppStatusStore((s: AppState) => s.range.end);
