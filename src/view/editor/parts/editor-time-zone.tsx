/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import { Select } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { usePrefs } from '../../../carbonio-ui-commons/utils/use-prefs';
import { findLabel, TimeZonesOptions } from '../../../settings/components/utils';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorDisabled,
	selectEditorTimezone
} from '../../../store/selectors/editor';
import { editEditorTimezone } from '../../../store/slices/editor-slice';

type SelectValue =
	| {
			label: string;
			value: string;
	  }
	| undefined;

export const EditorTimezone = ({ editorId }: { editorId: string }): ReactElement | null => {
	const [t] = useTranslation();
	const timezone = useAppSelector(selectEditorTimezone(editorId));
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const dispatch = useAppDispatch();
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	const { zimbraPrefUseTimeZoneListInCalendar } = usePrefs();
	const timeZonesOptions = useMemo(() => TimeZonesOptions(t), [t]);
	const timezoneLabel = t('timezones', 'Timezones');
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

	const onChange = useCallback(
		(item): void => {
			if (item) {
				const newTimezone = findLabel(timeZonesOptions, item);
				if (newTimezone) {
					setValue({ label: newTimezone, value: item });
				}
				dispatch(editEditorTimezone({ id: editorId, timezone: item }));
			}
		},
		[dispatch, editorId, timeZonesOptions]
	);

	return zimbraPrefUseTimeZoneListInCalendar === 'TRUE' && !allDay ? (
		<Select
			label={timezoneLabel}
			items={timeZonesOptions}
			multiple={false}
			onChange={onChange}
			selection={value}
			disabled={disabled?.timezone}
		/>
	) : null;
};
