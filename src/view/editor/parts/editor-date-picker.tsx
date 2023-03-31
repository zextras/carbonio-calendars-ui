/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Padding } from '@zextras/carbonio-design-system';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import {
	selectEditorAllDay,
	selectEditorDisabled,
	selectEditorEnd,
	selectEditorStart
} from '../../../store/selectors/editor';
import StartDatePicker from '../../../commons/start-date-picker';
import EndDatePicker from '../../../commons/end-date-picker';
import Styler from '../../../commons/date-picker-style';
import { editEditorDate } from '../../../store/slices/editor-slice';

type DatePickerProps = {
	editorId: string;
};

export const EditorDatePicker = ({ editorId }: DatePickerProps): ReactElement | null => {
	const allDay = useSelector(selectEditorAllDay(editorId));
	const start = useSelector(selectEditorStart(editorId));
	const end = useSelector(selectEditorEnd(editorId));
	const diff = useMemo(() => moment(end).diff(moment(start)), [end, start]);
	const disabled = useSelector(selectEditorDisabled(editorId));
	const dispatch = useDispatch();

	const onChange = useCallback(
		({ start: newStartValue, end: newEndValue }) => {
			dispatch(editEditorDate({ id: editorId, start: newStartValue, end: newEndValue }));
		},
		[dispatch, editorId]
	);

	return start && end ? (
		<Styler allDay={allDay} orientation="horizontal" height="fit" mainAlignment="flex-start">
			<StartDatePicker
				start={start}
				end={end}
				onChange={onChange}
				diff={diff}
				allDay={allDay}
				disabled={disabled?.datePicker}
			/>
			<Padding left="small" />
			<EndDatePicker
				start={start}
				end={end}
				onChange={onChange}
				diff={diff}
				allDay={allDay}
				disabled={disabled?.datePicker}
			/>
		</Styler>
	) : null;
};
