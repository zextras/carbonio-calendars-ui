/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManagerContext, SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectInstanceInvite } from '../store/selectors/invites';
import { applyTag, createAndApplyTag } from '../view/tags/tag-actions';
import { editAppointmentItem } from '../actions/appointment-actions-items';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useEventPanelViewHeaderActions = (event: any): any => {
	const tags = useTags();
	const createModal = useContext(ModalManagerContext);
	const dispatch = useDispatch();
	const createSnackbar = useContext(SnackbarManagerContext);
	const context = {
		tags,
		createAndApplyTag,
		replaceHistory,
		createModal,
		dispatch,
		createSnackbar
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
