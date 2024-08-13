/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { filter } from 'lodash';

import {
	deleteCalendarItem,
	editCalendarItem,
	emptyTrashItem,
	exportAppointmentICSItem,
	findSharesItem,
	importCalendarICSItem,
	moveToRootItem,
	newCalendarItem,
	removeFromListItem,
	shareCalendarUrlItem,
	sharesInfoItem
} from '../actions/calendar-actions-items';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { ActionsClick } from '../types/actions';

type CalendarActionsProps = {
	id: string;
	icon: string;
	label: string;
	onClick: (e: ActionsClick) => void;
	disabled?: boolean;
};
export const useCalendarActions = (
	item: Folder,
	inputRef?: React.RefObject<HTMLInputElement>
): Array<CalendarActionsProps> => {
	const { createModal, closeModal } = useModal();
	const createSnackbar = useSnackbar();

	if (!item) return [];

	const actions = [
		newCalendarItem({ createModal, closeModal, item }),
		moveToRootItem({ createSnackbar, item }),
		emptyTrashItem({ createModal, closeModal, item }),
		editCalendarItem({ createModal, closeModal, item }),
		deleteCalendarItem({ createModal, closeModal, item }),
		removeFromListItem({ item, createSnackbar }),
		shareCalendarUrlItem({ createModal, closeModal, item }),
		findSharesItem({ createModal, closeModal, item }),
		sharesInfoItem({ item, createModal, closeModal }),
		exportAppointmentICSItem({ item }),
		importCalendarICSItem(item, inputRef)
	];

	return filter(actions, ['disabled', false]);
};
