/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Checkbox } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { isNil } from 'lodash';
import moment from 'moment';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	selectEditorAllDay,
	selectEditorDisabled,
	selectEditorEnd,
	selectEditorStart
} from '../../../store/selectors/editor';
import { editEditorAllDay } from '../../../store/slices/editor-slice';

type AllDayProps = {
	editorId: string;
};

export const EditorAllDayCheckbox = ({ editorId }: AllDayProps): ReactElement | null => {
	const allDay = useSelector(selectEditorAllDay(editorId));
	const start = useSelector(selectEditorStart(editorId));
	const end = useSelector(selectEditorEnd(editorId));
	const disabled = useSelector(selectEditorDisabled(editorId));
	const dispatch = useDispatch();
	const startDate = useMemo(() => (start ? new Date(start) : undefined), [start]);
	const endDate = useMemo(() => (end ? new Date(end) : undefined), [end]);
	const diff = useMemo(() => moment(end).diff(moment(start)), [end, start]);

	const onClick = useCallback(
		(e) => {
			if (e && startDate && endDate) {
				const startValue = startDate.setHours(0, 0, 0, 0);
				const endValue = startValue + diff;
				dispatch(
					editEditorAllDay({ id: editorId, allDay: !allDay, start: startValue, end: endValue })
				);
			}
			dispatch(editEditorAllDay({ id: editorId, allDay: !allDay }));
		},
		[allDay, diff, dispatch, editorId, endDate, startDate]
	);

	return !isNil(allDay) ? (
		<Checkbox
			label={t('label.all_day', 'All day')}
			onClick={onClick}
			value={allDay}
			disabled={disabled?.allDay}
			data-testid="editor-allDay"
		/>
	) : null;
};
