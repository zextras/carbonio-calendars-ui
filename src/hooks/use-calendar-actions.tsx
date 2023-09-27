/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';

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
import { isNestedInTrash, isRoot } from '../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { hasId } from '../carbonio-ui-commons/worker/handle-message';
import { SIDEBAR_ITEMS } from '../constants/sidebar';
import { ActionsClick } from '../types/actions';

type CalendarActionsProps = {
	id: string;
	icon: string;
	label: string;
	onClick: (e: ActionsClick) => void;
	disabled?: boolean;
};
export const useCalendarActions = (item: Folder): Array<CalendarActionsProps> => {
	const createModal = useModal();
	const createSnackbar = useSnackbar();

	if (!item) return [];
	if (hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) || hasId(item, FOLDERS.CALENDAR)) {
		return [
			newCalendarItem({ createModal, item }),
			moveToRootItem({ createSnackbar, item }),
			editCalendarItem({ createModal, item }),
			deleteCalendarItem({ createModal, item }),
			shareCalendarItem({ createModal, item }),
			shareCalendarUrlItem({ createModal, item })
		];
	}
	if (hasId(item, FOLDERS.TRASH)) {
		return [
			newCalendarItem({ createModal, item }),
			moveToRootItem({ createSnackbar, item }),
			emptyTrashItem({ createModal, item }),
			editCalendarItem({ createModal, item }),
			deleteCalendarItem({ createModal, item }),
			shareCalendarItem({ createModal, item }),
			shareCalendarUrlItem({ createModal, item })
		];
	}
	if (isNestedInTrash(item)) {
		return [
			newCalendarItem({ createModal, item }),
			moveToRootItem({ createSnackbar, item }),
			editCalendarItem({ createModal, item }),
			deleteCalendarItem({ createModal, item }),
			shareCalendarItem({ createModal, item }),
			shareCalendarUrlItem({ createModal, item })
		];
	}
	if (!isRoot(item) && item.isLink && item.owner) {
		// shared folders in own account and shared folders in secondary accounts
		return [
			editCalendarItem({ createModal, item }),
			removeFromListItem({ item, createSnackbar }),
			sharesInfoItem({ item, createModal })
		];
	}

	// custom folders
	return [
		newCalendarItem({ createModal, item }),
		moveToRootItem({ createSnackbar, item }),
		editCalendarItem({ createModal, item }),
		deleteCalendarItem({ createModal, item }),
		shareCalendarItem({ createModal, item }),
		shareCalendarUrlItem({ createModal, item })
	];
};
