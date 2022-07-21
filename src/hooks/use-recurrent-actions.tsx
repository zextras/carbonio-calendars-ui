/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManagerContext } from '@zextras/carbonio-design-system';
import { FOLDERS, useTags } from '@zextras/carbonio-shell-ui';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	deletePermanentlyItem,
	editAppointmentItem,
	moveAppointmentItem,
	moveApptToTrashItem,
	openInDisplayerItem
} from '../actions/action-items';
import { ActionsContext } from '../types/actions';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { applyTag } from '../view/tags/tag-actions';

export const useGetRecurrentActions = (
	invite: Invite,
	event: EventType,
	context = {} as ActionsContext
): any => {
	const { isInstance } = context;
	const [t] = useTranslation();
	const createModal = useContext(ModalManagerContext);
	const tags = useTags();

	return useMemo(
		() =>
			invite
				? [
						openInDisplayerItem(event, context, t),
						editAppointmentItem(invite, event, context, t),
						invite.ciFolder === FOLDERS.TRASH
							? deletePermanentlyItem(invite, event, { ...context, isInstance, createModal }, t)
							: moveApptToTrashItem(invite, event, { ...context, isInstance, createModal }, t),
						moveAppointmentItem(event, invite, { ...context, isInstance, createModal }, t),
						...(isInstance ? [] : [applyTag({ t, context: { ...context, tags }, event })])
				  ]
				: [],
		[invite, event, context, t, isInstance, createModal, tags]
	);
};
