/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Row, SingleSelectionOnChange, Tooltip } from '@zextras/carbonio-design-system';

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

	return calendarId ? (
		<>
			{isDraft ? (
				<Tooltip label={'Use move option to move event to a different calendar'}>
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
