/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Row, SingleSelectionOnChange, Tooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { CalendarSelector } from './calendar-selector';
import { normalizeCalendarEditor } from '../../../normalizations/normalize-editor';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorCalendarId,
	selectEditorDisabled,
	selectEditorIsDraft
} from '../../../store/selectors/editor';
import { editEditorCalendar } from '../../../store/slices/editor-slice';
import { CalendarEditor } from '../../../types/editor';

export const EditorCalendarSelector = ({ editorId }: { editorId: string }): ReactElement | null => {
	const [t] = useTranslation();

	const calendarId = useAppSelector(selectEditorCalendarId(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const isDraft = useAppSelector(selectEditorIsDraft(editorId));
	const dispatch = useAppDispatch();

	const onChange = useCallback<SingleSelectionOnChange<CalendarEditor>>(
		(value) => {
			if (value) {
				const calendar = normalizeCalendarEditor(value);
				const data = {
					id: editorId,
					calendar
				};
				dispatch(editEditorCalendar(data));
			}
		},
		[dispatch, editorId]
	);

	const disabledCalendarTooltipLabel = t(
		'tooltip.calendarSelector.disabled',
		"To move this event to another calendar use the 'Move' option"
	);

	return calendarId ? (
		<>
			{isDraft ? (
				<Tooltip label={disabledCalendarTooltipLabel}>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<CalendarSelector
							calendarId={calendarId}
							onCalendarChange={onChange}
							disabled
							excludeTrash
						/>
					</Row>
				</Tooltip>
			) : (
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<CalendarSelector
						calendarId={calendarId}
						onCalendarChange={onChange}
						disabled={disabled?.calendar}
						excludeTrash
					/>
				</Row>
			)}
		</>
	) : null;
};
