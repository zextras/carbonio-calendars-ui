/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManagerContext } from '@zextras/carbonio-design-system';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { moveApptToTrash } from './use-event-actions';

export const useGetRecurrentActions = (event, context = {}) => {
	const { onClose, isInstance } = context;
	const [t] = useTranslation();
	const createModal = useContext(ModalManagerContext);

	const query = useMemo(() => (isInstance ? '?isInstance=TRUE' : ''), [isInstance]);
	const actions = useMemo(
		() => [
			{
				id: 'openindisplayer',
				icon: 'ExpandOutline',
				label: 'Open in displayer',
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
				label: 'Edit',
				click: (ev) => {
					if (ev) ev.stopPropagation();
					onClose();
					replaceHistory(
						`/${event.resource.calendar.id}/${EventActionsEnum.EDIT}/${event.resource.id}/${event.resource.ridZ}${query}`
					);
				}
			},
			moveApptToTrash(event, { isInstance, createModal }, t)
		],
		[createModal, event, isInstance, onClose, query, t]
	);

	return actions;
};
