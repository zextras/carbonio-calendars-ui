/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TFunction } from 'react-i18next';
import { SettingsSubSection } from '@zextras/carbonio-shell-ui';

export const generalSubSection = (t: TFunction): SettingsSubSection => ({
	label: t('label.general', 'General'),
	id: 'general'
});
export const workWeekSubSection = (t: TFunction): SettingsSubSection => ({
	label: t('label.work_week', 'Work week'),
	id: 'work_week'
});
export const creatingAppointmentsSubSection = (t: TFunction): SettingsSubSection => ({
	label: t('label.create_appt_settings', 'Creating Appointments'),
	id: 'create_appt_settings'
});
export const iCalSubSection = (t: TFunction): SettingsSubSection => ({
	label: t('label.apple_ical', 'Apple iCal'),
	id: 'ical'
});
export const permissionsSubSection = (t: TFunction): SettingsSubSection => ({
	label: t('label.permissions', 'Permissions'),
	id: 'permissions'
});

export const getSettingsSubSections = (t: TFunction): Array<SettingsSubSection> => [
	generalSubSection(t),
	workWeekSubSection(t),
	creatingAppointmentsSubSection(t),
	iCalSubSection(t),
	permissionsSubSection(t)
];
