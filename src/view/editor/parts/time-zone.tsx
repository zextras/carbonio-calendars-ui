/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select } from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { findLabel, TimeZonesOptions } from '../../../settings/components/utils';

export const EditorTimezone = ({ editorId, callbacks }): JSX.Element | null => {
	const [t] = useTranslation();
	const { onTimeZoneChange } = callbacks;
	const { zimbraPrefUseTimeZoneListInCalendar, zimbraPrefTimeZoneId } = useUserSettings().prefs;
	const timeZonesOptions = useMemo(() => TimeZonesOptions(t), [t]);

	return zimbraPrefUseTimeZoneListInCalendar === 'TRUE' ? (
		<Select
			items={timeZonesOptions}
			onChange={onTimeZoneChange}
			defaultSelection={
				invite?.start.tz
					? {
							label: findLabel(timeZonesOptions, invite?.start.tz),
							value: invite?.start.tz
					  }
					: {
							label: findLabel(timeZonesOptions, startTimeZone || zimbraPrefTimeZoneId),
							value: startTimeZone || zimbraPrefTimeZoneId
					  }
			}
		/>
	) : null;
};
