/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS, getBridgedFunctions, t } from '@zextras/carbonio-shell-ui';
import React, { useState, useCallback, ReactElement } from 'react';
import { useFolder } from '../../carbonio-ui-commons/store/zustand/folder';
import { moveAppointmentRequest } from '../../store/actions/move-appointment';
import { useAppDispatch } from '../../store/redux/hooks';
import { EventType } from '../../types/event';
import { NewModal } from './new-calendar-modal';
import { MoveModal } from './move-modal';

type MoveAppointmentProps = {
	onClose: () => void;
	event: EventType;
};

export const MoveApptModal = ({ onClose, event }: MoveAppointmentProps): ReactElement | null => {
	const dispatch = useAppDispatch();
	const currentFolder = useFolder(event.resource.calendar.id);
	const [showNewFolderModal, setShowNewFolderModal] = useState(false);

	const toggleModal = useCallback(
		() => setShowNewFolderModal(!showNewFolderModal),
		[showNewFolderModal]
	);

	const moveAppt = (data: any): void => {
		dispatch(moveAppointmentRequest(data)).then((res: any) => {
			if (res.type.includes('fulfilled')) {
				getBridgedFunctions().createSnackbar({
					key: event.resource.calendar.id === FOLDERS.TRASH ? 'restore' : 'move',
					replace: true,
					type: 'info',
					hideButton: true,
					label:
						event.resource.calendar.id === FOLDERS.TRASH
							? `${t('message.snackbar.appt_restored', 'Appointment restored successfully to')} ${
									data.destinationCalendarName
							  }`
							: `${t('message.snackbar.appt_moved', 'Appointment moved successfully to')} ${
									data.destinationCalendarName
							  }`,
					autoHideTimeout: 3000
				});
			} else {
				getBridgedFunctions().createSnackbar({
					key: event.resource.calendar.id === FOLDERS.TRASH ? 'restore' : 'move',
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
					currentFolder={currentFolder}
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
