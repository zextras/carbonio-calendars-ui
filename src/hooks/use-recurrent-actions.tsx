/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManagerContext } from '@zextras/carbonio-design-system';
import { FOLDERS, replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	deletePermanentlyItem,
	moveAppointmentItem,
	moveApptToTrashItem
} from '../actions/action-items';
import { getVirtualRoom } from '../normalizations/normalize-editor';
import { ActionsContext } from '../types/actions';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { Invite } from '../types/store/invite';
import { applyTag } from '../view/tags/tag-actions';
import { generateEditor } from '../commons/editor-generator';

export const useGetRecurrentActions = (invite: Invite, context = {} as ActionsContext): any => {
	const { onClose, isInstance } = context;
	const [t] = useTranslation();
	const createModal = useContext(ModalManagerContext);

	const query = useMemo(() => (isInstance ? '?isInstance=TRUE' : ''), [isInstance]);
	const tags = useTags();

	return useMemo(
		() => [
			{
				id: 'openindisplayer',
				icon: 'ExpandOutline',
				label: t('event.action.expand', 'Open in Displayer'),
				click: (ev: Event): void => {
					if (ev) ev.stopPropagation();
					if (onClose) {
						onClose();
					}
					replaceHistory(
						`/${invite.ciFolder}/${EventActionsEnum.EXPAND}/${invite.apptId}/${context.ridZ}${query}`
					);
				}
			},
			{
				id: 'edit',
				icon: 'Edit2Outline',
				label: t('label.edit', 'Edit'),
				click: (ev: Event): void => {
					if (ev) ev.stopPropagation();
					if (onClose) {
						onClose();
					}
					const boardContext = {
						ridZ: context?.ridZ,
						isInstance,
						isException: invite.isException,
						title: invite.name,
						location: invite.location,
						room: getVirtualRoom(invite.xprop),
						attendees: [],
						optionalAttendees: [],
						allDay: invite.allDay,
						freeBusy: invite.freeBusy,
						class: invite.class,
						start: invite.start,
						end: invite.end
					};
					const { editor } = generateEditor(invite.apptId, boardContext);
					replaceHistory(`/${invite.ciFolder}/${EventActionsEnum.EDIT}/${editor.id}${query}`);
				}
			},
			invite.ciFolder === FOLDERS.TRASH
				? deletePermanentlyItem(invite, { ...context, isInstance, createModal }, t)
				: moveApptToTrashItem(invite, { ...context, isInstance, createModal }, t),
			moveAppointmentItem(invite, { ...context, isInstance, createModal }, t),
			...(isInstance ? [] : [applyTag({ t, context: { ...context, tags }, invite })])
		],
		[createModal, invite, isInstance, onClose, query, t, tags, context]
	);
};
