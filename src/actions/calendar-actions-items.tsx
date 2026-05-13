/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import {
	CloseModalFn,
	Container,
	CreateModalFn,
	CreateSnackbarFn,
	Icon,
	Padding,
	Text
} from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import {
	FOLDERS,
	isNestedInTrash,
	isTrashOrNestedInIt,
	Folder,
	LinkFolder,
	hasId
} from '@zextras/carbonio-ui-commons';
import { isNil } from 'lodash';

import {
	addIcsFromUrl,
	deleteCaldavCalendar,
	deleteCalendar,
	editCaldavCalendar,
	editCalendar,
	emptyTrash,
	exportCalendarICSFn,
	findShares,
	moveToRoot,
	newCalendar,
	removeFromList,
	shareCalendar,
	syncCaldavCalendar,
	syncExternalCalendar,
	sharesInfo
} from './calendar-actions-fn';
import {
	isCaldavChild,
	isCaldavRootFolder,
	isExternalSyncFolder,
	isLinkChild,
	isMainRootChild
} from 'commons/utilities';
import { CalendarActionsId, FOLDER_ACTIONS, SIDEBAR_ITEMS } from 'constants/sidebar';

export type CalendarActionsItems = {
	id: CalendarActionsId;
	icon: string;
	disabled: boolean;
	label: string;
	onClick: (ev: React.SyntheticEvent | KeyboardEvent) => void;
	tooltipLabel: string;
	customComponent?: React.ReactNode;
};

const formatLsd = (lsd: number): string => {
	const date = new Date(lsd * 1000);
	const day = `${date.getDate()}`.padStart(2, '0');
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const year = `${date.getFullYear()}`.slice(-2);
	const hour = `${date.getHours()}`.padStart(2, '0');
	const minute = `${date.getMinutes()}`.padStart(2, '0');

	return `${day}/${month}/${year} ${hour}:${minute}`;
};

export const noPermissionLabel = t(
	'label.no_rights',
	'You do not have permission to perform this action'
);

export const newCalendarItem = ({
	createModal,
	closeModal,
	item
}: {
	createModal: CreateModalFn;
	closeModal: CloseModalFn;
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
	onClick: newCalendar({ createModal, closeModal, item })
});

export const moveToRootItem = ({
	createSnackbar,
	item
}: {
	createSnackbar: CreateSnackbarFn;
	item: { id: string; absFolderPath?: string; depth: number; parent?: string; l?: string };
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
		!!(item as LinkFolder)?.owner ||
		isCaldavChild(item),
	tooltipLabel: noPermissionLabel,
	onClick: moveToRoot({ createSnackbar, item })
});

export const emptyTrashItem = ({
	createModal,
	closeModal,
	item
}: {
	createModal: CreateModalFn;
	closeModal: CloseModalFn;
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
	onClick: emptyTrash({ createModal, closeModal }),
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
	closeModal,
	item
}: {
	createModal: CreateModalFn;
	closeModal: CloseModalFn;
	item: { id: string; absFolderPath?: string; f?: string; url?: string };
}): CalendarActionsItems => {
	const isCaldavChildFolder = isCaldavChild(item as any);
	return {
		id: FOLDER_ACTIONS.EDIT,
		icon: 'Edit2Outline',
		label: isCaldavChildFolder
			? t('action.edit_calendar', 'Edit calendar')
			: t('action.edit_and_share_calendar', 'Edit and share calendar'),
		tooltipLabel: noPermissionLabel,
		onClick: editCalendar({ createModal, closeModal, item }),
		disabled: hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) || isTrashOrNestedInIt(item)
	};
};

export const editExternalCalendarItem = ({
	createModal,
	closeModal,
	item
}: {
	createModal: CreateModalFn;
	closeModal: CloseModalFn;
	item: { id: string; absFolderPath?: string; f?: string; url?: string };
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.EDIT,
	icon: 'Edit2Outline',
	label: t('action.edit_calendar', 'Edit calendar'),
	tooltipLabel: noPermissionLabel,
	onClick: editCalendar({ createModal, closeModal, item }),
	disabled: hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) || isTrashOrNestedInIt(item)
});

export const deleteCalendarItem = ({
	createModal,
	closeModal,
	item
}: {
	createModal: CreateModalFn;
	closeModal: CloseModalFn;
	item: Folder;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.DELETE,
	icon: 'Trash2Outline',
	label: isNestedInTrash(item)
		? t('label.delete_permanently', 'Delete permanently')
		: t('action.delete_calendar', 'Delete calendar'),
	tooltipLabel: noPermissionLabel,
	onClick: deleteCalendar({ createModal, closeModal, item }),
	disabled:
		hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) ||
		hasId(item, FOLDERS.CALENDAR) ||
		hasId(item, FOLDERS.TRASH) ||
		(!isExternalSyncFolder(item) && (item.perm ? !/w/.test(item.perm) : false))
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
	closeModal,
	item
}: {
	item: { id: string; absFolderPath?: string };
	createModal: CreateModalFn;
	closeModal: CloseModalFn;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.SHARES_INFO,
	icon: 'InfoOutline',
	label: t('shares_info', 'Shares Info'),
	tooltipLabel: noPermissionLabel,
	onClick: sharesInfo({ createModal, closeModal, item }),
	disabled:
		!(item as LinkFolder).isLink ||
		isLinkChild(item) ||
		hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) ||
		hasId(item, FOLDERS.CALENDAR) ||
		isTrashOrNestedInIt(item)
});

export const shareCalendarItem = ({
	createModal,
	closeModal,
	item
}: {
	item: Folder;
	createModal: CreateModalFn;
	closeModal: CloseModalFn;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.SHARE,
	icon: 'SharedCalendarOutline',
	label: t('action.share_calendar', 'Share Calendar'),
	tooltipLabel: noPermissionLabel,
	onClick: shareCalendar({ createModal, closeModal, item }),
	disabled:
		hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) ||
		isTrashOrNestedInIt(item) ||
		(item.perm ? !/w/.test(item.perm) : false)
});

export const findSharesItem = ({
	createModal,
	closeModal,
	item
}: {
	item: { name: string; id: string; absFolderPath?: string };
	createModal: CreateModalFn;
	closeModal: CloseModalFn;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.FIND_SHARES,
	icon: 'PlusOutline',
	label: t('find_shares', 'Find shares'),
	tooltipLabel: noPermissionLabel,
	onClick: findShares({ createModal, closeModal }),
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

const isIcsImportActionDisabled = (item: Folder): boolean =>
	hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) ||
	isTrashOrNestedInIt(item) ||
	(item as LinkFolder).isLink ||
	isLinkChild(item);

export const addExternalCalendarsItem = ({
	createModal,
	closeModal,
	item
}: {
	createModal: CreateModalFn;
	closeModal: CloseModalFn;
	item: Folder;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.ADD_ICS_URL,
	icon: 'Link2',
	label: t('action.add_external_calendars', 'Add external calendars'),
	tooltipLabel: noPermissionLabel,
	onClick: addIcsFromUrl({ createModal, closeModal }),
	disabled: isIcsImportActionDisabled(item)
});

export const syncExternalCalendarItem = ({
	item,
	createSnackbar
}: {
	item: Folder;
	createSnackbar: CreateSnackbarFn;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.SYNC,
	icon: 'SyncOutline',
	label: t('label.sync', 'Sync'),
	customComponent: (
		<Container orientation="horizontal" width="fit" mainAlignment="space-between">
			<Container orientation="horizontal" mainAlignment="flex-start">
				<Icon icon={'SyncOutline'} />
				<Padding left="small" />
				<Text>{t('label.sync', 'Sync')}</Text>
			</Container>
			{item?.lsd ? (
				<>
					<Padding left={'12px'} />
					<Text size="extrasmall" color="gray0" weight={'light'} style={{ overflow: 'visible' }}>
						{t('label.last_sync', 'Last sync')}: {formatLsd(item?.lsd)}
					</Text>
				</>
			) : null}
		</Container>
	),
	tooltipLabel: noPermissionLabel,
	onClick: syncExternalCalendar({ item, createSnackbar }),
	disabled: !isExternalSyncFolder(item) || isTrashOrNestedInIt(item)
});

export const syncCaldavCalendarItem = ({
	item,
	createSnackbar
}: {
	item: Folder;
	createSnackbar: CreateSnackbarFn;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.SYNC,
	icon: 'SyncOutline',
	label: t('label.sync', 'Sync'),
	customComponent: (
		<Container orientation="horizontal" width="fit" mainAlignment="space-between">
			<Container orientation="horizontal" mainAlignment="flex-start">
				<Icon icon={'SyncOutline'} />
				<Padding left="small" />
				<Text>{t('label.sync', 'Sync')}</Text>
			</Container>
			{item?.lsd ? (
				<>
					<Padding left={'12px'} />
					<Text size="extrasmall" color="gray0" weight={'light'} style={{ overflow: 'visible' }}>
						{t('label.last_sync', 'Last sync')}: {formatLsd(item?.lsd)}
					</Text>
				</>
			) : null}
		</Container>
	),
	tooltipLabel: noPermissionLabel,
	onClick: syncCaldavCalendar({ item, createSnackbar }),
	disabled:
		!isCaldavRootFolder({ dsId: item.dsId, dsType: item.dsType }) || isTrashOrNestedInIt(item)
});

export const editCaldavCalendarItem = ({
	createModal,
	closeModal,
	item
}: {
	createModal: CreateModalFn;
	closeModal: CloseModalFn;
	item: Folder;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.EDIT,
	icon: 'Edit2Outline',
	label: t('action.edit_name', 'Edit name'),
	tooltipLabel: noPermissionLabel,
	onClick: editCaldavCalendar({ createModal, closeModal, item }),
	disabled: hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) || isTrashOrNestedInIt(item)
});

export const deleteCaldavCalendarItem = ({
	createModal,
	closeModal,
	item
}: {
	createModal: CreateModalFn;
	closeModal: CloseModalFn;
	item: Folder;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.DELETE,
	icon: 'DeletePermanentlyOutline',
	label: t('label.delete_permanently', 'Delete permanently'),
	tooltipLabel: noPermissionLabel,
	onClick: deleteCaldavCalendar({ createModal, closeModal, item }),
	disabled:
		hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR) ||
		hasId(item, FOLDERS.CALENDAR) ||
		hasId(item, FOLDERS.TRASH) ||
		!isCaldavRootFolder({ dsId: item.dsId, dsType: item.dsType })
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
	disabled: isIcsImportActionDisabled(item)
});
