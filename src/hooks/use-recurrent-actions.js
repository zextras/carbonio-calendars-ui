/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManagerContext } from '@zextras/carbonio-design-system';
import { FOLDERS, getBridgedFunctions, replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { applyTag } from '../view/tags/tag-actions';
import { moveApptToTrash, deletePermanently, moveAppointment } from './use-event-actions';
import { generateEditor } from '../commons/editor-generator';
import { CALENDAR_ROUTE } from '../constants';
import moment from 'moment';

export const useGetRecurrentActions = (event, context = {}) => {
	const { onClose, isInstance } = context;
	const [t] = useTranslation();
	const createModal = useContext(ModalManagerContext);

	const query = useMemo(() => (isInstance ? '?isInstance=TRUE' : ''), [isInstance]);
	const tags = useTags();

	const actions = useMemo(
		() => [
			{
				id: 'openindisplayer',
				icon: 'ExpandOutline',
				label: t('event.action.expand', 'Open in Displayer'),
				click: (ev) => {
					if (ev) ev.stopPropagation();
					onClose();
					replaceHistory(
						`/${event.resource.calendar.id}/${EventActionsEnum.EXPAND}/${event.resource.id}/${event.resource.ridZ}${query}`
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
						organizer: event.resource.organizer,
						title: event.title,
						location: event.resource.location,
						room: event.resource.room,
						attendees: [],
						optionalAttendees: [],
						allDay: event.allDay,
						freeBusy: event.resource.freeBusy,
						class: event.resource.class,
						start: event.start.valueOf(),
						end: event.end.valueOf()
					};
					const { editor, callbacks } = generateEditor(event.resource.id, boardContext);
					getBridgedFunctions().addBoard(`${CALENDAR_ROUTE}/`, { ...editor, callbacks });
					replaceHistory(
						`/${event.resource.calendar.id}/${EventActionsEnum.EDIT}/${editor.id}${query}`
					);
				}
			},
			event.resource.calendar.id === FOLDERS.TRASH
				? deletePermanently({ event, context: { ...context, isInstance, createModal }, t })
				: moveApptToTrash(event, { isInstance, createModal }, t),
			moveAppointment(event, { ...context, isInstance, createModal }, t),
			...(isInstance ? [] : [applyTag({ t, context: { ...context, tags }, event })])
		],
		[createModal, event, isInstance, onClose, query, t, tags, context]
	);

	return actions;
};
