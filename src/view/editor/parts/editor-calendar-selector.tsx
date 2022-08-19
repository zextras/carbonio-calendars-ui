/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Row } from '@zextras/carbonio-design-system';
import { selectEditorCalendar, selectEditorDisabled } from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';
import { CalendarSelector } from './calendar-selector';

type EditorCalendarSelectorProps = {
	editorId: string;
	callbacks: EditorCallbacks;
};

export const EditorCalendarSelector = ({
	editorId,
	callbacks
}: EditorCalendarSelectorProps): ReactElement | null => {
	const { onCalendarChange } = callbacks;
	const calendar = useSelector(selectEditorCalendar(editorId));
	const disabled = useSelector(selectEditorDisabled(editorId));

	return (
		<Row height="fit" width="fill" padding={{ top: 'large' }}>
			<CalendarSelector
				calendarId={calendar?.id}
				onCalendarChange={onCalendarChange}
				disabled={disabled?.calendar}
			/>
		</Row>
	);
};
