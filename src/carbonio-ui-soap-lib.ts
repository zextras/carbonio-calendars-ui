/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '@zextras/carbonio-ui-soap-lib';

declare module '@zextras/carbonio-ui-soap-lib' {
	interface AccountSettingsPrefs {
		zimbraPrefDefaultCalendarId: string;
		zimbraPrefCalendarDefaultApptDuration: string;
		zimbraPrefCalendarWorkingHours: string;
		zimbraPrefTimeZoneId: string;
		zimbraPrefCalendarFirstDayOfWeek: string;
		zimbraPrefCalendarInitialView: string;
		zimbraPrefCalendarApptReminderWarningTime: string;
		zimbraPrefUseTimeZoneListInCalendar: string;
		zimbraPrefCalendarForwardInvitesTo: string;
		zimbraPrefAppleIcalDelegationEnabled: string;
	}
}
