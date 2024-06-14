/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { CreateModalFn, CreateSnackbarFn } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { isNil } from 'lodash';

import {
	deleteCalendar,
	editCalendar,
	emptyTrash,
	exportCalendarICSFn,
	findShares,
	moveToRoot,
	newCalendar,
	removeFromList,
	shareCalendar,
	shareCalendarUrl,
	sharesInfo
} from './calendar-actions-fn';
import {
	isNestedInTrash,
	isTrashOrNestedInIt
} from '../carbonio-ui-commons/store/zustand/folder/utils';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { Folder, LinkFolder } from '../carbonio-ui-commons/types/folder';
import { hasId } from '../carbonio-ui-commons/worker/handle-message';
import { isLinkChild, isMainRootChild } from '../commons/utilities';
import { CalendarActionsId, FOLDER_ACTIONS, SIDEBAR_ITEMS } from '../constants/sidebar';

export type CalendarActionsItems = {
	id: CalendarActionsId;
	icon: string;
	disabled: boolean;
	label: string;
	onClick: (ev: React.SyntheticEvent | KeyboardEvent) => void;
	tooltipLabel: string;
};

export const noPermissionLabel = t(
	'label.no_rights',
	'You do not have permission to perform this action'
);

export const newCalendarItem = ({
	createModal,
	item
}: {
	createModal: CreateModalFn;
	item: { id: string; perm?: string };
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.NEW,
	icon: 'CalendarOutline',
	label: t('label.new_calendar', 'New calendar'),
	disabled:
		isTrashOrNestedInIt(item) ||
		(item.perm ? !/w/.test(item.perm) : false) ||
		hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR),
	tooltipLabel: noPermissionLabel,
	onClick: newCalendar({ createModal, item })
});

export const moveToRootItem = ({
	createSnackbar,
	item
}: {
	createSnackbar: CreateSnackbarFn;
	item: { id: string; absFolderPath?: string; depth: number };
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.MOVE_TO_ROOT,
	icon: 'MoveOutline',
	label: isNestedInTrash(item)
		? t('label.restore_calendar', 'Restore calendar')
		: t('action.move_to_root', 'Move to root'),
	disabled:
		hasId(item, FOLDERS.TRASH) ||
		hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) ||
		hasId(item, FOLDERS.CALENDAR) ||
		item.depth < 2 ||
		isLinkChild(item) ||
		!!(item as LinkFolder)?.owner,
	tooltipLabel: noPermissionLabel,
	onClick: moveToRoot({ createSnackbar, item })
});

export const emptyTrashItem = ({
	createModal,
	item
}: {
	createModal: CreateModalFn;
	item: { id: string; children?: Array<Folder>; n?: number };
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.EMPTY_TRASH,
	icon: 'DeletePermanentlyOutline',
	label: t('action.empty_trash', 'Empty Trash'),
	tooltipLabel:
		hasId(item, FOLDERS.TRASH) &&
		!isNil(item?.n) &&
		item?.n < 1 &&
		!isNil(item?.children) &&
		item.children.length < 1
			? t('action.Trash_already_empty', 'trash is already empty')
			: noPermissionLabel,
	onClick: emptyTrash({ createModal, item }),
	disabled:
		!hasId(item, FOLDERS.TRASH) ||
		(hasId(item, FOLDERS.TRASH) &&
			!isNil(item?.n) &&
			item?.n < 1 &&
			!isNil(item?.children) &&
			item.children.length < 1)
});

export const editCalendarItem = ({
	createModal,
	item
}: {
	createModal: CreateModalFn;
	item: { id: string; absFolderPath?: string };
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.EDIT,
	icon: 'Edit2Outline',
	label: t('action.edit_calendar_properties', 'Edit calendar properties'),
	tooltipLabel: noPermissionLabel,
	onClick: editCalendar({ createModal, item }),
	disabled: hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) || isTrashOrNestedInIt(item)
});

export const deleteCalendarItem = ({
	createModal,
	item
}: {
	createModal: CreateModalFn;
	item: Folder;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.DELETE,
	icon: 'Trash2Outline',
	label: isNestedInTrash(item)
		? t('label.delete_permanently', 'Delete permanently')
		: t('action.delete_calendar', 'Delete calendar'),
	tooltipLabel: noPermissionLabel,
	onClick: deleteCalendar({ createModal, item }),
	disabled:
		hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) ||
		hasId(item, FOLDERS.CALENDAR) ||
		hasId(item, FOLDERS.TRASH) ||
		(item.perm ? !/w/.test(item.perm) : false)
});

export const removeFromListItem = ({
	item,
	createSnackbar
}: {
	item: { id: string; absFolderPath?: string };
	createSnackbar: CreateSnackbarFn;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.REMOVE_FROM_LIST,
	icon: 'CloseOutline',
	label: t('remove_from_this_list', 'Remove shared calendar'),
	tooltipLabel: noPermissionLabel,
	onClick: removeFromList({ item, createSnackbar }),
	disabled:
		!(item as LinkFolder).isLink ||
		isLinkChild(item) ||
		hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) ||
		hasId(item, FOLDERS.CALENDAR) ||
		isTrashOrNestedInIt(item)
});

export const sharesInfoItem = ({
	createModal,
	item
}: {
	item: { id: string; absFolderPath?: string };
	createModal: CreateModalFn;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.SHARES_INFO,
	icon: 'InfoOutline',
	label: t('shares_info', 'Shares Info'),
	tooltipLabel: noPermissionLabel,
	onClick: sharesInfo({ createModal, item }),
	disabled:
		!(item as LinkFolder).isLink ||
		isLinkChild(item) ||
		hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) ||
		hasId(item, FOLDERS.CALENDAR) ||
		isTrashOrNestedInIt(item)
});

export const shareCalendarItem = ({
	createModal,
	item
}: {
	item: Folder;
	createModal: CreateModalFn;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.SHARE,
	icon: 'SharedCalendarOutline',
	label: t('action.share_calendar', 'Share Calendar'),
	tooltipLabel: noPermissionLabel,
	onClick: shareCalendar({ createModal, item }),
	disabled:
		hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) ||
		isTrashOrNestedInIt(item) ||
		(item.perm ? !/w/.test(item.perm) : false)
});

export const shareCalendarUrlItem = ({
	createModal,
	item
}: {
	item: { name: string; id: string; absFolderPath?: string };
	createModal: CreateModalFn;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.SHARE_URL,
	icon: 'Copy',
	label: t('action.calendar_access_share', 'Calendar access share'),
	tooltipLabel: noPermissionLabel,
	onClick: shareCalendarUrl({ createModal, item }),
	disabled:
		(item as LinkFolder).isLink ||
		isTrashOrNestedInIt(item) ||
		hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR)
});

export const findSharesItem = ({
	createModal,
	item
}: {
	item: { name: string; id: string; absFolderPath?: string };
	createModal: CreateModalFn;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.FIND_SHARES,
	icon: 'PlusOutline',
	label: t('find_shares', 'Find shares'),
	tooltipLabel: noPermissionLabel,
	onClick: findShares({ createModal }),
	disabled:
		isTrashOrNestedInIt(item) || hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) || !isMainRootChild(item)
});

export const exportAppointmentICSItem = ({ item }: { item: Folder }): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.EXPORT_ICS,
	icon: 'Download',
	label: t('action.export_calendar_ics', 'Export ICS file'),
	tooltipLabel: noPermissionLabel,
	onClick: exportCalendarICSFn({ item }),
	disabled:
		hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) ||
		isTrashOrNestedInIt(item) ||
		(item as LinkFolder).isLink ||
		isLinkChild(item)
});

export const importCalendarICSItem = (
	item: Folder,
	ref?: React.RefObject<HTMLInputElement>
): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.UPLOAD,
	icon: 'Upload',
	label: t('action.calendar_upload', 'Import ICS file'),
	tooltipLabel: noPermissionLabel,
	onClick: (): void => {
		if (ref?.current) {
			ref.current.click();
		}
	},
	disabled:
		hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) ||
		isTrashOrNestedInIt(item) ||
		(item as LinkFolder).isLink ||
		isLinkChild(item)
});
