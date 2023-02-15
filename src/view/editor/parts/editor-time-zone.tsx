/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select } from '@zextras/carbonio-design-system';
import React, { ReactElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { usePrefs } from '../../../carbonio-ui-commons/utils/use-prefs';
import { findLabel, TimeZonesOptions } from '../../../settings/components/utils';
import { selectEditorDisabled, selectEditorTimezone } from '../../../store/selectors/editor';
import { EditorProps } from '../../../types/editor';

type SelectValue =
	| {
			label: string;
			value: string;
	  }
	| undefined;

export const EditorTimezone = ({ editorId, callbacks }: EditorProps): ReactElement | null => {
	const [t] = useTranslation();
	const timezone = useSelector(selectEditorTimezone(editorId));

	const { zimbraPrefUseTimeZoneListInCalendar } = usePrefs();
	const timeZonesOptions = useMemo(() => TimeZonesOptions(t), [t]);

	const [value, setValue] = useState<SelectValue>(() => {
		if (timezone && zimbraPrefUseTimeZoneListInCalendar === 'TRUE') {
			const label = findLabel(timeZonesOptions, timezone);
			if (label) {
				return {
					label,
					value: timezone
				};
			}
		}
		return undefined;
	});
	const { onTimeZoneChange } = callbacks;
	const disabled = useSelector(selectEditorDisabled(editorId));

	return value && zimbraPrefUseTimeZoneListInCalendar === 'TRUE' ? (
		<Select
			items={timeZonesOptions}
			multiple={false}
			onChange={(item): void => {
				if (item) {
					const newTimezone = findLabel(timeZonesOptions, item);
					if (newTimezone) {
						setValue({ label: newTimezone, value: item });
					}
					onTimeZoneChange(item);
				}
			}}
			selection={value}
			disabled={disabled?.timezone}
		/>
	) : null;
};
