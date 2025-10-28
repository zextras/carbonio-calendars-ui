/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { Folder } from '@zextras/carbonio-ui-commons';
import { filter } from 'lodash';

import {
	CalendarActionsItems,
	deleteCalendarItem,
	editCalendarItem,
	emptyTrashItem,
	exportAppointmentICSItem,
	findSharesItem,
	importCalendar,
	importCalendarFromURL,
	importCalendarICSItem,
	moveToRootItem,
	newCalendarItem,
	removeFromListItem,
	sharesInfoItem,
	syncCalendar
} from '../actions/calendar-actions-items';

export const useCalendarActions = (
	item: Folder,
	inputRef?: React.RefObject<HTMLInputElement>
): Array<CalendarActionsItems> => {
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
		findSharesItem({ createModal, closeModal, item }),
		sharesInfoItem({ item, createModal, closeModal }),
		exportAppointmentICSItem({ item }),
		syncCalendar({ item, createSnackbar }),
		window.external_calendar_feature
			? importCalendar(item, [
					importCalendarICSItem(item, inputRef),
					importCalendarFromURL({ createModal, closeModal, item })
				])
			: importCalendarICSItem(item, inputRef)
	];

	return filter(actions, ['disabled', false]);
};
