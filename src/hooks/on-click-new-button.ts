/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { addBoard, t } from '@zextras/carbonio-shell-ui';
import { useCallback } from 'react';
import { generateEditor } from '../commons/editor-generator';
import { CALENDAR_ROUTE } from '../constants';
import { useAppDispatch } from '../store/redux/hooks';
import { useCalendarFolders } from './use-calendar-folders';

export const useOnClickNewButton = (): ((ev?: MouseEvent) => void) => {
	const calendarFolders = useCalendarFolders();
	const dispatch = useAppDispatch();

	return useCallback(
		(ev) => {
			ev?.preventDefault?.();
			const editor = generateEditor({
				context: {
					title: t('label.new_appointment', 'New Appointment'),
					panel: false,
					dispatch,
					folders: calendarFolders
				}
			});
			addBoard({
				url: `${CALENDAR_ROUTE}/`,
				title: editor.title ?? '',
				...editor
			});
		},
		[calendarFolders, dispatch]
	);
};
