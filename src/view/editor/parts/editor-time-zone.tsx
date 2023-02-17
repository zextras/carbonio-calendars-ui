/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Select } from '@zextras/carbonio-design-system';
import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePrefs } from '../../../carbonio-ui-commons/utils/use-prefs';
import { findLabel, TimeZonesOptions } from '../../../settings/components/utils';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorDisabled, selectEditorTimezone } from '../../../store/selectors/editor';
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
	const dispatch = useAppDispatch();

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
	const disabled = useAppSelector(selectEditorDisabled(editorId));

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

	return value && zimbraPrefUseTimeZoneListInCalendar === 'TRUE' ? (
		<Select
			items={timeZonesOptions}
			multiple={false}
			onChange={onChange}
			selection={value}
			disabled={disabled?.timezone}
		/>
	) : null;
};
