/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { useModal } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { GROUP_ACTIONS, GroupActionsId } from '../constants/event-actions';
import { SIDEBAR_ITEMS } from '../constants/sidebar';
import { ActionsClick } from '../types/actions';
import { EditGroupModal } from '../view/sidebar/edit-group-modal';

export type GroupActionsItems = {
	id: GroupActionsId;
	icon: string;
	disabled: boolean;
	keepOpen?: boolean;
	label: string;
	onClick?: (ev: ActionsClick) => void;
	tooltipLabel: string;
};

const useCalendarGroupDeleteActionFn = (calendarGroupId: string): (() => void) => {
	const { createModal, closeModal } = useModal();

	return useCallback(
		() =>
			createModal(
				{
					id: GROUP_ACTIONS.EDIT,
					// TODO: complete the modal with the correct component
					children: <></>
				},
				true
			),
		[createModal]
	);
};

const useCalendarGroupEditActionFn = (calendarGroupId: string): (() => void) => {
	const { createModal, closeModal } = useModal();

	return useCallback(
		() =>
			createModal(
				{
					id: GROUP_ACTIONS.EDIT,
					children: (
						<EditGroupModal
							onClose={(): void => closeModal(GROUP_ACTIONS.EDIT)}
							groupId={calendarGroupId}
						/>
					)
				},
				true
			),
		[calendarGroupId, closeModal, createModal]
	);
};

const useCalendarGroupDeleteActionItem = (calendarGroupId: string): GroupActionsItems => {
	const deleteGroup = useCalendarGroupDeleteActionFn(calendarGroupId);
	return {
		id: GROUP_ACTIONS.DELETE,
		icon: 'Trash2Outline',
		disabled: calendarGroupId === SIDEBAR_ITEMS.ALL_CALENDAR,
		tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
		label: t('label.delete_permanently', 'Delete permanently'),
		onClick: deleteGroup
	};
};

const useCalendarGroupEditActionItem = (calendarGroupId: string): GroupActionsItems => {
	const edit = useCalendarGroupEditActionFn(calendarGroupId);
	return {
		id: GROUP_ACTIONS.EDIT,
		icon: 'Edit2Outline',
		disabled: calendarGroupId === SIDEBAR_ITEMS.ALL_CALENDAR,
		tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
		label: t('action.edit_group', 'Edit group'),
		onClick: edit
	};
};

export const useCalendarGroupActions = (
	calendarGroupId: string
): { editGroup: GroupActionsItems; deleteGroup: GroupActionsItems } => {
	const editGroup = useCalendarGroupEditActionItem(calendarGroupId);
	const deleteGroup = useCalendarGroupDeleteActionItem(calendarGroupId);
	return { editGroup, deleteGroup };
};
