/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Checkbox, Container } from '@zextras/carbonio-design-system';
import { isNil } from 'lodash';
import React, { useCallback, useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
	selectEditorAllDay,
	selectEditorEnd,
	selectEditorStart
} from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

type AllDayProps = {
	editorId: string;
	callbacks: EditorCallbacks;
};

export const EditorAllDayCheckbox = ({ editorId, callbacks }: AllDayProps): JSX.Element | null => {
	const allDay = useSelector(selectEditorAllDay(editorId));
	const start = useSelector(selectEditorStart(editorId));
	const end = useSelector(selectEditorEnd(editorId));
	const [t] = useTranslation();
	const { onAllDayChange } = callbacks;

	const startDate = useMemo(() => new Date(start), [start]);
	const endDate = useMemo(() => new Date(end), [end]);

	const onChange = useCallback(
		(e) => {
			if (e) {
				const startValue = startDate.setHours(0, 0, 0, 0);
				const endValue = endDate.setHours(0, 0, 0, 0);
				onAllDayChange(e, startValue, endValue);
			}
			onAllDayChange(e);
		},
		[endDate, onAllDayChange, startDate]
	);

	return !isNil(allDay) ? (
		<Checkbox label={t('label.all_day', 'All day')} onChange={onChange} checked={allDay} />
	) : null;
};
