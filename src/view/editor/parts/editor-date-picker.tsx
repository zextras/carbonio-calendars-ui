/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Padding } from '@zextras/carbonio-design-system';
import moment from 'moment';
import React, { ReactElement, useMemo } from 'react';
import Styler from '../../../commons/date-picker-style';
import EndDatePicker from '../../../commons/end-date-picker';
import StartDatePicker from '../../../commons/start-date-picker';
import { useAppSelector } from '../../../hooks/redux';
import {
	selectEditorAllDay,
	selectEditorDisabled,
	selectEditorEnd,
	selectEditorStart
} from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

type DatePickerProps = {
	editorId: string;
	callbacks: EditorCallbacks;
};

export const EditorDatePicker = ({ editorId, callbacks }: DatePickerProps): ReactElement | null => {
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const diff = useMemo(() => moment(end).diff(moment(start)), [end, start]);
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const { onDateChange } = callbacks;

	return start && end ? (
		<Styler allDay={allDay} orientation="horizontal" height="fit" mainAlignment="flex-start">
			<StartDatePicker
				start={start}
				end={end}
				onChange={onDateChange}
				diff={diff}
				allDay={allDay}
				disabled={disabled?.datePicker}
			/>
			<Padding left="small" />
			<EndDatePicker
				start={start}
				end={end}
				onChange={onDateChange}
				diff={diff}
				allDay={allDay}
				disabled={disabled?.datePicker}
			/>
		</Styler>
	) : null;
};
