/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useContext, useMemo } from 'react';

import { ModalManagerContext, SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { replaceHistory, useTags } from '@zextras/carbonio-shell-ui';

import { useCalendarFolders } from './use-calendar-folders';
import { openAppointment } from '../actions/appointment-actions-fn';
import { useAppDispatch } from '../store/redux/hooks';
import { PanelView } from '../types/actions';
import { createAndApplyTag } from '../view/tags/tag-actions';

export const useSearchViewActions = ({ event }: { event?: any }): any => {
	const dispatch = useAppDispatch();
	const createModal = useContext(ModalManagerContext);
	const tags = useTags();
	const createSnackbar = useContext(SnackbarManagerContext);
	const calendarFolders = useCalendarFolders();
	const context = useMemo(
		() => ({
			tags,
			createAndApplyTag,
			replaceHistory,
			createModal,
			dispatch,
			panelView: 'search' as PanelView,
			createSnackbar,
			folders: calendarFolders
		}),
		[calendarFolders, createModal, createSnackbar, dispatch, tags]
	);

	return useMemo(() => {
		if (!event) return undefined;
		return {
			open: openAppointment({
				event,
				context
			})
		};
	}, [context, event]);
};
