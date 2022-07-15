/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useAppStatusStore } from './store';

export const useCalendarView = (): string => useAppStatusStore((s) => s.calendarView);
export const useCalendarDate = (): Date => useAppStatusStore((s) => s.date);
export const useIsSummaryViewOpen = (): boolean => useAppStatusStore((s) => s.isSummaryViewOpen);
export const useCalendar = (): string | undefined => useAppStatusStore((s) => s.calendarId);
export const useAppointment = (): string | undefined => useAppStatusStore((s) => s.appointmentId);
export const useInstance = (): string | undefined => useAppStatusStore((s) => s.ridZ);
