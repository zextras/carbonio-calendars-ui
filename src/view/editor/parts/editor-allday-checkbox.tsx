/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Checkbox } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { isNil } from 'lodash';

import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import { selectEditorAllDay, selectEditorDisabled } from '../../../store/selectors/editor';
import { editEditorAllDay } from '../../../store/slices/editor-slice';

export const EditorAllDayCheckbox = ({ editorId }: { editorId: string }): ReactElement | null => {
	const allDay = useAppSelector(selectEditorAllDay(editorId));
	const disabled = useAppSelector(selectEditorDisabled(editorId));
	const dispatch = useAppDispatch();

	const onClick = useCallback(
		(e) => {
			if (e) {
				dispatch(editEditorAllDay({ id: editorId, allDay: !allDay }));
			}
		},
		[allDay, dispatch, editorId]
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
