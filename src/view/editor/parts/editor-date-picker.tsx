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
import { applyTimezoneToLocalDate } from '../../../utils/dates';

export const EditorDatePicker = ({ editorId }: { editorId: string }): ReactElement | null => {
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const timezone = useAppSelector(selectEditorTimezone(editorId));
	const diff = useMemo(() => moment(end).diff(moment(start)), [end, start]);
	const dispatch = useAppDispatch();

	const onChange = useCallback(
		({ start: newStartValue, end: newEndValue }: { start: number; end: number }) => {
			const startDate = applyTimezoneToLocalDate(new Date(newStartValue ?? 0), timezone);
			const endDate = applyTimezoneToLocalDate(new Date(newEndValue ?? 0), timezone);
			dispatch(
				editEditorDate({ id: editorId, start: startDate.getTime(), end: endDate.getTime() })
			);
		},
		[dispatch, editorId, timezone]
	);

	const startValue = useMemo(
		() =>
			new Date(
				new Date(start ?? 0).toLocaleString('en-US', {
					timeZone: timezone
				})
			),
		[start, timezone]
	);

	const endValue = useMemo(
		() =>
			new Date(
				new Date(end ?? 0).toLocaleString('en-US', {
					timeZone: timezone
				})
			),
		[end, timezone]
	);

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
