/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SyntheticEvent, useContext } from 'react';

import { ModalManagerContext, SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { FOLDERS, t } from '@zextras/carbonio-shell-ui';

import {
	deleteCalendarItem,
	editCalendarItem,
	emptyTrashItem,
	moveToRootItem,
	newCalendarItem,
	removeFromListItem,
	shareCalendarItem,
	shareCalendarUrlItem,
	sharesInfoItem
} from '../actions/calendar-actions-items';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { FOLDER_ACTIONS, SIDEBAR_ITEMS } from '../constants/sidebar';

type CalendarActionsProps = {
	id: string;
	icon: string;
	label: string;
	onClick: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent) => void;
	disabled?: boolean;
};
export const useCalendarActions = (item: Folder): Array<CalendarActionsProps> => {
	const createModal = useContext(ModalManagerContext);
	const createSnackbar = useContext(SnackbarManagerContext);

	const actions = item
		? [
				newCalendarItem({ createModal }),
				moveToRootItem({ createSnackbar, item }),
				emptyTrashItem({ createModal, item }),
				editCalendarItem({ createModal, item }),
				deleteCalendarItem({ createModal, item }),
				removeFromListItem({ item }),
				sharesInfoItem({ createModal, item }),
				shareCalendarItem({ createModal, item }),
				shareCalendarUrlItem({ createModal, item })
		  ]
		: [];
	switch (item.id) {
		case FOLDERS.CALENDAR:
			return actions
				.filter(
					(action) =>
						action.id !== FOLDER_ACTIONS.EMPTY_TRASH &&
						action.id !== FOLDER_ACTIONS.REMOVE_FROM_LIST &&
						action.id !== FOLDER_ACTIONS.SHARES_INFO
				)
				.map((action) =>
					action.id !== FOLDER_ACTIONS.NEW &&
					action.id !== FOLDER_ACTIONS.EDIT &&
					action.id !== FOLDER_ACTIONS.SHARE &&
					action.id !== FOLDER_ACTIONS.SHARE_URL
						? { ...action, disabled: true }
						: action
				);
		case SIDEBAR_ITEMS.ALL_CALENDAR:
			return actions
				.filter(
					(action) =>
						action.id !== FOLDER_ACTIONS.EMPTY_TRASH &&
						action.id !== FOLDER_ACTIONS.REMOVE_FROM_LIST &&
						action.id !== FOLDER_ACTIONS.SHARES_INFO
				)
				.map((action) =>
					action.id !== FOLDER_ACTIONS.NEW ? { ...action, disabled: true } : action
				);
		// trash
		case FOLDERS.TRASH:
			return actions
				.filter(
					(action) =>
						action.id !== FOLDER_ACTIONS.REMOVE_FROM_LIST &&
						action.id !== FOLDER_ACTIONS.SHARES_INFO
				)
				.map((action) =>
					action.id === FOLDER_ACTIONS.EMPTY_TRASH ? action : { ...action, disabled: true }
				);
		// customizable folders
		default:
			return item.isLink && item?.owner
				? actions
						.filter(
							(action) =>
								action.id === FOLDER_ACTIONS.SHARES_INFO ||
								action.id === FOLDER_ACTIONS.REMOVE_FROM_LIST ||
								action.id === FOLDER_ACTIONS.EDIT
						)
						.map((action) => {
							if (action.id === FOLDER_ACTIONS.MOVE_TO_ROOT || action.id === FOLDER_ACTIONS.NEW) {
								return { ...action, disabled: true };
							}
							return action;
						})
				: actions
						.filter(
							(action) =>
								action.id !== FOLDER_ACTIONS.EMPTY_TRASH &&
								action.id !== FOLDER_ACTIONS.REMOVE_FROM_LIST &&
								action.id !== FOLDER_ACTIONS.SHARES_INFO
						)
						.map((action) => {
							if (item?.parent === FOLDERS.USER_ROOT && action.id === FOLDER_ACTIONS.MOVE_TO_ROOT) {
								return { ...action, disabled: true };
							}
							if (item?.parent === FOLDERS.TRASH && action.id === FOLDER_ACTIONS.MOVE_TO_ROOT) {
								return { ...action, label: t('label.restore_calendar', 'Restore calendar') };
							}
							return action;
						});
	}
};
