/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManagerContext, SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { PANEL_VIEW } from '../constants';
import { selectInstanceInvite } from '../store/selectors/invites';
import { PanelView } from '../types/actions';
import { applyTag, createAndApplyTag } from '../view/tags/tag-actions';
import { editAppointmentItem } from '../actions/appointment-actions-items';
import { useCalendarFolders } from './use-calendar-folders';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useEventPanelViewHeaderActions = (event: any): any => {
	const tags = useTags();
	const { pathname } = useLocation();
	const createModal = useContext(ModalManagerContext);
	const calendarFolders = useCalendarFolders();
	const dispatch = useDispatch();
	const createSnackbar = useContext(SnackbarManagerContext);
	const panelView = useMemo(
		() => (pathname.includes(PANEL_VIEW.SEARCH) ? PANEL_VIEW.SEARCH : PANEL_VIEW.APP) as PanelView,
		[pathname]
	);
	const context = {
		tags,
		createAndApplyTag,
		replaceHistory,
		createModal,
		dispatch,
		createSnackbar,
		folders: calendarFolders,
		panelView
	};
	const invite = useSelector(selectInstanceInvite(event.resource.inviteId));
	if (!invite || !event) return [];
	return event?.resource?.iAmOrganizer
		? [
				applyTag({
					event,
					context
				}),
				editAppointmentItem({ event, invite, context })
		  ]
		: [
				applyTag({
					event,
					context
				})
		  ];
};
