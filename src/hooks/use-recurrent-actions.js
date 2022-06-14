/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManagerContext } from '@zextras/carbonio-design-system';
import { FOLDERS, replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { applyTag } from '../view/tags/tag-actions';
import { deletePermanently, moveAppointment, moveApptToTrash } from './use-event-actions';
import { generateEditor } from '../commons/editor-generator';

export const useGetRecurrentActions = (event, context = {}) => {
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
				click: (ev) => {
					if (ev) ev.stopPropagation();
					onClose();
					replaceHistory(
						`/${context.calendar.id}/${EventActionsEnum.EXPAND}/${event.resource.id}/${event.resource.ridZ}${query}`
					);
				}
			},
			{
				id: 'edit',
				icon: 'Edit2Outline',
				label: t('label.edit', 'Edit'),
				click: (ev) => {
					if (ev) ev.stopPropagation();
					onClose();
					const boardContext = {
						title: event.title,
						location: event.location,
						room: event.room,
						attendees: [],
						optionalAttendees: [],
						allDay: event.allDay,
						freeBusy: event.freeBusy,
						class: event.class,
						start: event.start,
						end: event.end
					};
					const { editor } = generateEditor(event.resource.id, boardContext);
					replaceHistory(`/${context.calendar.id}/${EventActionsEnum.EDIT}/${editor.id}${query}`);
				}
			},
			context.calendar.id === FOLDERS.TRASH
				? deletePermanently({ event, context: { ...context, isInstance, createModal }, t })
				: moveApptToTrash(event, { isInstance, createModal }, t),
			moveAppointment(event, { ...context, isInstance, createModal }, t),
			...(isInstance ? [] : [applyTag({ t, context: { ...context, tags }, event })])
		],
		[createModal, event, isInstance, onClose, query, t, tags, context]
	);
};
