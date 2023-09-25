/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { t } from '@zextras/carbonio-shell-ui';
import { isNil } from 'lodash';

import {
	deleteCalendar,
	editCalendar,
	emptyTrash,
	moveToRoot,
	newCalendar,
	removeFromList,
	shareCalendar,
	shareCalendarUrl,
	sharesInfo
} from './calendar-actions-fn';
import { isTrashOrNestedInIt } from '../carbonio-ui-commons/store/zustand/folder/utils';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { CalendarActionsId, FOLDER_ACTIONS } from '../constants/sidebar';

type CalendarActionsContext = {
	createModal: any;
};

export type CalendarActionsItems = {
	id: CalendarActionsId;
	icon: string;
	disabled: boolean;
	label: string;
	onClick: (ev: React.SyntheticEvent | KeyboardEvent) => void;
	tooltipLabel: string;
};
export const newCalendarItem = ({ createModal }: CalendarActionsContext): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.NEW,
	icon: 'CalendarOutline',
	label: t('label.new_calendar', 'New calendar'),
	disabled: false,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: newCalendar({ createModal })
});

export const moveToRootItem = ({
	createSnackbar,
	item
}: {
	createSnackbar: any;
	item: any;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.MOVE_TO_ROOT,
	icon: 'MoveOutline',
	label: isTrashOrNestedInIt(item)
		? t('label.restore_calendar', 'Restore calendar')
		: t('action.move_to_root', 'Move to root'),
	disabled: false,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: moveToRoot({ createSnackbar, item })
});

export const emptyTrashItem = ({
	createModal,
	item
}: {
	createModal: any;
	item: any;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.EMPTY_TRASH,
	icon: 'SlashOutline',
	label: t('action.empty_trash', 'Empty Trash'),
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: emptyTrash({ createModal }),
	disabled:
		item.id !== FOLDERS.TRASH ||
		(item.id === FOLDERS.TRASH &&
			!isNil(item?.n) &&
			item?.n < 1 &&
			item.id === FOLDERS.TRASH &&
			!isNil(item?.children) &&
			item.children.length < 1)
});

export const editCalendarItem = ({
	createModal,
	item
}: {
	createModal: any;
	item: any;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.EDIT,
	icon: 'Edit2Outline',
	label: t('action.edit_calendar_properties', 'Edit calendar properties'),
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: editCalendar({ createModal, item }),
	disabled: false
});

export const deleteCalendarItem = ({
	createModal,
	item
}: {
	createModal: any;
	item: any;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.DELETE,
	icon: 'Trash2Outline',
	label: t('action.delete_calendar', 'Delete calendar'),
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: deleteCalendar({ createModal, item }),
	disabled: false
});

export const removeFromListItem = ({ item }: { item: any }): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.REMOVE_FROM_LIST,
	icon: 'CloseOutline',
	label: t('remove_from_this_list', 'Remove from this list'),
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: removeFromList({ item }),
	disabled: false
});

export const sharesInfoItem = ({
	createModal,
	item
}: {
	item: any;
	createModal: any;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.SHARES_INFO,
	icon: 'InfoOutline',
	label: t('shares_info', 'Shares Info'),
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: sharesInfo({ createModal, item }),
	disabled: false
});

export const shareCalendarItem = ({
	createModal,
	item
}: {
	item: any;
	createModal: any;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.SHARE,
	icon: 'SharedCalendarOutline',
	label: t('action.share_calendar', 'Share Calendar'),
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: shareCalendar({ createModal, item }),
	disabled: false
});

export const shareCalendarUrlItem = ({
	createModal,
	item
}: {
	item: any;
	createModal: any;
}): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.SHARE_URL,
	icon: 'Copy',
	label: t('action.calendar_access_share', 'Calendar access share'),
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: shareCalendarUrl({ createModal, item }),
	disabled: item?.id === FOLDERS.TRASH || item?.id?.includes(':') // todo: update condition
});
