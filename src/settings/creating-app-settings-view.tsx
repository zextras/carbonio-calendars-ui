/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Checkbox, FormSection, FormSubSection } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { AccountSettingsPrefs } from '@zextras/carbonio-ui-soap-lib';

import { creatingAppointmentsSubSection } from './sub-sections';
import { CalendarSelector } from '../view/editor/parts/calendar-selector';

export default function CreatingAppointmentSettings({
	settingsObj,
	updateSettings
}: {
	settingsObj: AccountSettingsPrefs;
	updateSettings: (e: {
		target: {
			name: string;
			value: string;
		};
	}) => void;
}): React.JSX.Element {
	const sectionTitleAppointments = useMemo(() => creatingAppointmentsSubSection(), []);

	return (
		<FormSection id={sectionTitleAppointments.id} label={sectionTitleAppointments.label}>
			<FormSubSection label={t('settings.label.default_calendar', 'Default calendar')}>
				<CalendarSelector
					calendarId={settingsObj.zimbraPrefDefaultCalendarId}
					onCalendarChange={(cal): void => {
						updateSettings({
							target: {
								name: 'zimbraPrefDefaultCalendarId',
								value: cal.id
							}
						});
					}}
					excludeTrash
				/>
			</FormSubSection>
			<FormSubSection label={t('label.time_zones', 'Time zones')}>
				<Checkbox
					value={settingsObj.zimbraPrefUseTimeZoneListInCalendar === 'TRUE'}
					label={t(
						'settings.label.show_timezones',
						'Show time zone while creating new appointment'
					)}
					onClick={(): void =>
						updateSettings({
							target: {
								name: 'zimbraPrefUseTimeZoneListInCalendar',
								value: settingsObj.zimbraPrefUseTimeZoneListInCalendar === 'TRUE' ? 'FALSE' : 'TRUE'
							}
						})
					}
				/>
			</FormSubSection>
		</FormSection>
	);
}
