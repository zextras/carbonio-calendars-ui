/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SettingsSubSection, t } from '@zextras/carbonio-shell-ui';

export const generalSubSection = (): SettingsSubSection => ({
	label: t('label.general', 'General'),
	id: 'general'
});
export const workWeekSubSection = (): SettingsSubSection => ({
	label: t('label.work_week', 'Work week'),
	id: 'work_week'
});
export const creatingAppointmentsSubSection = (): SettingsSubSection => ({
	label: t('label.create_appt_settings', 'Creating Appointments'),
	id: 'create_appt_settings'
});
export const iCalSubSection = (): SettingsSubSection => ({
	label: t('label.apple_ical', 'Apple iCal'),
	id: 'ical'
});
export const permissionsSubSection = (): SettingsSubSection => ({
	label: t('label.permissions', 'Permissions'),
	id: 'permissions'
});

export const getSettingsSubSections = (): Array<SettingsSubSection> => [
	generalSubSection(),
	workWeekSubSection(),
	creatingAppointmentsSubSection(),
	iCalSubSection(),
	permissionsSubSection()
];
