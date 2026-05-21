/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { Folder } from '@zextras/carbonio-ui-commons';
import { filter } from 'lodash';

import {
	addExternalCalendarsItem,
	deleteCaldavCalendarItem,
	deleteCalendarItem,
	editCaldavCalendarItem,
	editExternalCalendarItem,
	editCalendarItem,
	emptyTrashItem,
	exportAppointmentICSItem,
	findSharesItem,
	importCalendarICSItem,
	moveToRootItem,
	newCalendarItem,
	removeFromListItem,
	syncCaldavCalendarItem,
	syncExternalCalendarItem,
	sharesInfoItem
} from 'actions/calendar-actions-items';
import { isCaldavChild, isCaldavRootFolder, isExternalSyncFolder } from 'commons/utilities';
import { ActionsClick } from 'types/actions';

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
	const isCaldavCalendar = isCaldavRootFolder({ dsId: item.dsId, dsType: item.dsType });
	const isCaldavChildCalendar = isCaldavChild(item as any);
	const isExternalCalendar = isExternalSyncFolder(item);

	if (isCaldavCalendar) {
		return filter(
			[
				syncCaldavCalendarItem({ item, createSnackbar }),
				editCaldavCalendarItem({ createModal, closeModal, item }),
				deleteCaldavCalendarItem({ createModal, closeModal, item })
			],
			['disabled', false]
		);
	}

	if (isExternalCalendar) {
		return filter(
			[
				syncExternalCalendarItem({ item, createSnackbar }),
				editExternalCalendarItem({ createModal, closeModal, item }),
				deleteCalendarItem({ createModal, closeModal, item }),
				moveToRootItem({ createSnackbar, item })
			],
			['disabled', false]
		);
	}

	if (isCaldavChildCalendar) {
		return filter([editCalendarItem({ createModal, closeModal, item })], ['disabled', false]);
	}

	const actions = [
		newCalendarItem({ createModal, closeModal, item }),
		addExternalCalendarsItem({ createModal, closeModal, item }),
		moveToRootItem({ createSnackbar, item }),
		emptyTrashItem({ createModal, closeModal, item }),
		editCalendarItem({ createModal, closeModal, item }),
		deleteCalendarItem({ createModal, closeModal, item }),
		removeFromListItem({ item, createSnackbar }),
		findSharesItem({ createModal, closeModal, item }),
		sharesInfoItem({ item, createModal, closeModal }),
		exportAppointmentICSItem({ item }),
		importCalendarICSItem(item, inputRef)
	];

	return filter(actions, ['disabled', false]);
};
