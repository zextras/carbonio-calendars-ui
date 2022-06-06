/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Padding } from '@zextras/carbonio-design-system';
import React from 'react';
import { useSelector } from 'react-redux';
import {
	selectEditorAllDay,
	selectEditorEnd,
	selectEditorStart
} from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';
import StartDatePicker from '../../event-panel-edit/components/start-date-picker';
import EndDatePicker from '../../event-panel-edit/components/end-date-picker';
import Styler from '../../event-panel-edit/components/date-picker-style';

type DatePickerProps = {
	editorId: string;
	callbacks: EditorCallbacks;
};

export const EditorDatePicker = ({ editorId, callbacks }: DatePickerProps): JSX.Element | null => {
	const allDay = useSelector(selectEditorAllDay(editorId));
	const start = useSelector(selectEditorStart(editorId));
	const end = useSelector(selectEditorEnd(editorId));
	const { onDateChange } = callbacks;

	return start && end ? (
		<Styler allDay={allDay} orientation="horizontal" height="fit" mainAlignment="flex-start">
			<StartDatePicker start={start} end={end} onChange={onDateChange} allDay={allDay} />
			<Padding left="small" />
			<EndDatePicker start={start} end={end} onChange={onDateChange} allDay={allDay} />
		</Styler>
	) : null;
};
