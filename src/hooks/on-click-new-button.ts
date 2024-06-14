/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SyntheticEvent, useCallback } from 'react';

import { addBoard } from '@zextras/carbonio-shell-ui';

import { useFoldersMap } from '../carbonio-ui-commons/store/zustand/folder';
import { generateEditor } from '../commons/editor-generator';
import { CALENDAR_ROUTE } from '../constants';
import { useAppDispatch } from '../store/redux/hooks';

export const useOnClickNewButton = (): ((
	ev?: SyntheticEvent<HTMLElement, Event> | KeyboardEvent
) => void) => {
	const calendarFolders = useFoldersMap();
	const dispatch = useAppDispatch();

	return useCallback(
		(ev) => {
			ev?.preventDefault?.();
			const editor = generateEditor({
				context: {
					panel: false,
					dispatch,
					folders: calendarFolders
				}
			});

			addBoard({
				url: `${CALENDAR_ROUTE}/`,
				title: editor.title ?? '',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				editor
			});
		},
		[calendarFolders, dispatch]
	);
};
