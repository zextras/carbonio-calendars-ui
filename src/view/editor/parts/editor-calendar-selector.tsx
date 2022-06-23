/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { Row } from '@zextras/carbonio-design-system';
import { selectEditorCalendar } from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';
import { CalendarSelector } from './calendar-selector';

type EditorCalendarSelectorProps = {
	editorId: string;
	callbacks: EditorCallbacks;
	disabled?: boolean;
};

export const EditorCalendarSelector = ({
	editorId,
	callbacks,
	disabled
}: EditorCalendarSelectorProps): JSX.Element | null => {
	const { onCalendarChange } = callbacks;
	const calendar = useSelector(selectEditorCalendar(editorId));

	return (
		<Row height="fit" width="fill" padding={{ top: 'large' }}>
			<CalendarSelector
				calendarId={calendar?.id}
				onCalendarChange={onCalendarChange}
				disabled={disabled}
			/>
		</Row>
	);
};
