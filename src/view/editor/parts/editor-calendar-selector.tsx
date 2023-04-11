/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserAccount } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback } from 'react';
import { Row } from '@zextras/carbonio-design-system';
import { selectEditorCalendar, selectEditorDisabled } from '../../../store/selectors/editor';
import { editEditorCalendar } from '../../../store/slices/editor-slice';
import { CalendarSelector } from './calendar-selector';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';

export const EditorCalendarSelector = ({ editorId }: { editorId: string }): ReactElement | null => {
	const calendar = useAppSelector(selectEditorCalendar(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const dispatch = useAppDispatch();

	const onChange = useCallback(
		(value) => {
			const account = getUserAccount();
			if (value) {
				const calResource = {
					id: value.id,
					name: value.name,
					color: value.color
				};
				const organizer = {
					email: value.owner ?? '',
					name: '',
					sentBy: account.name
				};
				const data = {
					id: editorId,
					calendar: calResource,
					organizer: value.isShared ? organizer : undefined
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
