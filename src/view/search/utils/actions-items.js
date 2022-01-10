/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EventActionsEnum } from '../../../types/enums/event-actions-enum';
import { editEventFn } from './actions-fn';

export const editEventItem = (event, action, history, pathname, apptId, ridZ, t) => ({
	id: EventActionsEnum.EDIT,
	icon: 'Edit2Outline',
	label: t('label.edit', 'Edit'),
	disabled: !event.permission,
	click: (ev) => editEventFn(ev, { action, history, pathname, apptId, ridZ })
});

export const moveInstanceToTrash = (event, t, context) => ({
	id: EventActionsEnum.TRASH,
	icon: 'Trash2Outline',
	label: t('label.delete', 'Delete'),
	disabled: false,
	click: (ev) => {
		if (ev) ev.stopPropagation();
		context.toggleDeleteModal(event, context.isInstance);
	}
});
