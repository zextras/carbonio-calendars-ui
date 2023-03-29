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
import { useAppSelector } from '../../../hooks/redux';
import {
	selectEditorAllDay,
	selectEditorDisabled,
	selectEditorEnd,
	selectEditorStart
} from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

type AllDayProps = {
	editorId: string;
	callbacks: EditorCallbacks;
};

export const EditorAllDayCheckbox = ({ editorId, callbacks }: AllDayProps): ReactElement | null => {
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const start = useAppSelector(selectEditorStart(editorId));
	const end = useAppSelector(selectEditorEnd(editorId));
	const { onAllDayChange } = callbacks;
	const disabled = useAppSelector(selectEditorDisabled(editorId));

	const startDate = useMemo(() => (start ? new Date(start) : undefined), [start]);
	const endDate = useMemo(() => (end ? new Date(end) : undefined), [end]);
	const diff = useMemo(() => moment(end).diff(moment(start)), [end, start]);

	const onClick = useCallback(
		(e) => {
			if (e && startDate && endDate) {
				const startValue = startDate.setHours(0, 0, 0, 0);
				const endValue = startValue + diff;
				onAllDayChange(!allDay, startValue, endValue);
			}
			onAllDayChange(!allDay);
		},
		[allDay, diff, endDate, onAllDayChange, startDate]
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
