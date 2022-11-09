/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManagerContext, SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { replaceHistory, useFolders, useTags } from '@zextras/carbonio-shell-ui';
import { filter } from 'lodash';
import { useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectInstanceInvite } from '../store/selectors/invites';
import { createAndApplyTag } from '../view/tags/tag-actions';
import { getAppointmentActionsItems } from '../actions/get-appointment-actions-items';
import { getRecurrentAppointmentActionsItems } from '../actions/get-recurrent-appointment-actions-items';
import { GetActionReturnType } from './types';

export const useEventSummaryViewActions = ({
	onClose,
	event
}: {
	onClose?: () => void;
	event?: any;
}): GetActionReturnType => {
	const invite = useSelector(selectInstanceInvite(event?.resource?.inviteId));
	const dispatch = useDispatch();
	const createModal = useContext(ModalManagerContext);
	const tags = useTags();
	const createSnackbar = useContext(SnackbarManagerContext);
	const folders = useFolders();
	const calendarFolders = useMemo(() => filter(folders, ['view', 'appointment']), [folders]);
	const context = useMemo(
		() => ({
			tags,
			folders: calendarFolders,
			createAndApplyTag,
			replaceHistory,
			createModal,
			dispatch,
			createSnackbar,
			onClose
		}),
		[calendarFolders, createModal, createSnackbar, dispatch, onClose, tags]
	);

	return useMemo(() => {
		if (!event || !invite) return undefined;
		if (event.resource.isRecurrent) {
			return getRecurrentAppointmentActionsItems({
				event,
				invite,
				context
			});
		}
		return getAppointmentActionsItems({
			event,
			invite,
			context
		});
	}, [event, invite, context]);
};
