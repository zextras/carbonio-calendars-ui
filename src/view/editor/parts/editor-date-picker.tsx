/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Padding, Row } from '@zextras/carbonio-design-system';
import moment from 'moment';

import EndDatePicker from '../../../commons/end-date-picker';
import StartDatePicker from '../../../commons/start-date-picker';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAllDay,
	selectEditorEnd,
	selectEditorStart,
	selectEditorTimezone
} from '../../../store/selectors/editor';
import { editEditorDate } from '../../../store/slices/editor-slice';

export const EditorDatePicker = ({ editorId }: { editorId: string }): ReactElement | null => {
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const timezone = useAppSelector(selectEditorTimezone(editorId));
	const diff = useMemo(() => moment(end).diff(moment(start)), [end, start]);
	const dispatch = useAppDispatch();

	const onChange = useCallback(
		({ start: newStartValue, end: newEndValue }: { start: number; end: number }) => {
			dispatch(editEditorDate({ id: editorId, start: newStartValue, end: newEndValue }));
		},
		[dispatch, editorId]
	);
	/*
	const changeTimezone = useCallback(
		(date = 0) => {
			const currentDate = new Date(date);
			const dateInTimezone = new Date(
				currentDate.toLocaleString('en-US', {
					timeZone: timezone
				})
			);
			console.log('@@ ', currentDate.getTime(), dateInTimezone.getTime());
			return dateInTimezone;
		},
		[timezone]
	);

	const startValue = useMemo(() => changeTimezone(start), [changeTimezone, start]);
	const endValue = useMemo(() => changeTimezone(end), [changeTimezone, end]); */

	const startValue = useMemo(() => new Date(start), [start]);
	const endValue = useMemo(() => new Date(end), [end]);

	return startValue && endValue ? (
		<>
			<Row takeAvailableSpace>
				<StartDatePicker start={startValue} onChange={onChange} diff={diff} allDay={allDay} />
			</Row>
			<Padding left="small" />
			<Row takeAvailableSpace>
				<EndDatePicker
					start={startValue}
					end={endValue}
					onChange={onChange}
					diff={diff}
					allDay={allDay}
				/>
			</Row>
		</>
	) : null;
};
