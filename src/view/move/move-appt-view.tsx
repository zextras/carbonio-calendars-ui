/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useCallback, ReactElement } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { FOLDERS, t } from '@zextras/carbonio-shell-ui';

import { MoveModal } from './move-modal';
import { NewModal } from './new-calendar-modal';
import { useFolder } from '../../carbonio-ui-commons/store/zustand/folder';
import { hasId } from '../../carbonio-ui-commons/worker/handle-message';
import { moveAppointmentRequest } from '../../store/actions/move-appointment';
import { useAppDispatch } from '../../store/redux/hooks';
import { EventType } from '../../types/event';

type MoveAppointmentProps = {
	onClose: () => void;
	event: EventType;
};

export const MoveApptModal = ({ onClose, event }: MoveAppointmentProps): ReactElement | null => {
	const dispatch = useAppDispatch();
	const currentFolder = useFolder(event.resource.calendar.id);
	const [showNewFolderModal, setShowNewFolderModal] = useState(false);
	const createSnackbar = useSnackbar();
	const toggleModal = useCallback(
		() => setShowNewFolderModal(!showNewFolderModal),
		[showNewFolderModal]
	);

	const moveAppt = (data: any): void => {
		dispatch(moveAppointmentRequest(data)).then((res: any) => {
			if (res.type.includes('fulfilled')) {
				createSnackbar({
					key: hasId(event.resource.calendar, FOLDERS.TRASH) ? 'restore' : 'move',
					replace: true,
					type: 'info',
					hideButton: true,
					label: hasId(event.resource.calendar, FOLDERS.TRASH)
						? `${t('message.snackbar.appt_restored', 'Appointment restored successfully to')} ${
								data.destinationCalendarName
							}`
						: `${t('message.snackbar.appt_moved', 'Appointment moved successfully to')} ${
								data.destinationCalendarName
							}`,
					autoHideTimeout: 3000
				});
			} else {
				createSnackbar({
					key: hasId(event.resource.calendar, FOLDERS.TRASH) ? 'restore' : 'move',
					replace: true,
					type: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			}
		});
	};

	return currentFolder ? (
		<>
			{showNewFolderModal ? (
				<NewModal
					toggleModal={toggleModal}
					onClose={onClose}
					folderId={currentFolder.id}
					event={event}
					action={moveAppt}
				/>
			) : (
				<MoveModal
					toggleModal={toggleModal}
					onClose={onClose}
					currentFolder={currentFolder}
					event={event}
					action={moveAppt}
				/>
			)}
		</>
	) : null;
};
