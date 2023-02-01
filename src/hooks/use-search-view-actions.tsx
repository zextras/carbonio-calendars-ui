/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManagerContext, SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { openAppointment } from '../actions/appointment-actions-fn';
import { PanelView } from '../types/actions';
import { createAndApplyTag } from '../view/tags/tag-actions';
import { useCalendarFolders } from './use-calendar-folders';

export const useSearchViewActions = ({ event }: { event?: any }): any => {
	const dispatch = useDispatch();
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
