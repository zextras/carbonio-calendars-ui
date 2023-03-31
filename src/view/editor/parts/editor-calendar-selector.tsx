/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserAccount } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row } from '@zextras/carbonio-design-system';
import { selectEditorCalendar, selectEditorDisabled } from '../../../store/selectors/editor';
import { editEditorCalendar } from '../../../store/slices/editor-slice';
import { CalendarSelector } from './calendar-selector';

type EditorCalendarSelectorProps = {
	editorId: string;
};

export const EditorCalendarSelector = ({
	editorId
}: EditorCalendarSelectorProps): ReactElement | null => {
	const calendar = useSelector(selectEditorCalendar(editorId));
	const disabled = useSelector(selectEditorDisabled(editorId));
	const dispatch = useDispatch();

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
