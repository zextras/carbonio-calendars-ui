/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Row } from '@zextras/carbonio-design-system';

import { CalendarSelector } from './calendar-selector';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorCalendar, selectEditorDisabled } from '../../../store/selectors/editor';
import { editEditorCalendar } from '../../../store/slices/editor-slice';

export const EditorCalendarSelector = ({ editorId }: { editorId: string }): ReactElement | null => {
	const calendar = useAppSelector(selectEditorCalendar(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const dispatch = useAppDispatch();

	const onChange = useCallback(
		(value) => {
			if (value) {
				const calResource = {
					id: value.id,
					name: value.name,
					color: value.color,
					owner: value.owner
				};
				const data = {
					id: editorId,
					calendar: calResource
				};
				dispatch(editEditorCalendar(data));
			}
		},
		[dispatch, editorId]
	);
	return (
		<Row height="fit" width="fill" padding={{ top: 'large' }}>
			<CalendarSelector
				calendarId={calendar?.id}
				onCalendarChange={onChange}
				disabled={disabled?.calendar}
				excludeTrash
			/>
		</Row>
	);
};
