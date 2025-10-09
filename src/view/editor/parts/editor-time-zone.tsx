/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import { Select, SingleSelectionOnChange } from '@zextras/carbonio-design-system';
import { usePrefs } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { findLabel, TimeZonesOptions } from '../../../settings/components/utils';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorDisabled,
	selectEditorEnd,
	selectEditorStart,
	selectEditorTimezone
} from '../../../store/selectors/editor';
import { editEditorDate, editEditorTimezone } from '../../../store/slices/editor-slice';
import { applyTimezoneToLocalDate } from '../../../utils/dates';

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
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));

	const { zimbraPrefUseTimeZoneListInCalendar } = usePrefs();
	const timeZonesOptions = useMemo(() => TimeZonesOptions(), []);
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

	const onChange = useCallback<SingleSelectionOnChange>(
		(item): void => {
			if (item) {
				const newTimezone = findLabel(timeZonesOptions, item);
				if (newTimezone) {
					setValue({ label: newTimezone, value: item });
				}
				const initialStart = new Date(start ?? 0);
				const initialToOriginalStart = new Date(
					initialStart.toLocaleString('en-US', {
						timeZone: timezone
					})
				);
				const originalToNewStartTimezone = applyTimezoneToLocalDate(initialToOriginalStart, item);

				const initialEnd = new Date(end ?? 0);
				const initialToOriginalEnd = new Date(
					initialEnd.toLocaleString('en-US', {
						timeZone: timezone
					})
				);
				const originalToNewEndTimezone = applyTimezoneToLocalDate(initialToOriginalEnd, item);
				dispatch(
					editEditorDate({
						id: editorId,
						start: originalToNewStartTimezone.getTime(),
						end: originalToNewEndTimezone.getTime()
					})
				);
				dispatch(editEditorTimezone({ id: editorId, timezone: item }));
			}
		},
		[dispatch, editorId, end, start, timeZonesOptions, timezone]
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
