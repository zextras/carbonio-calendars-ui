/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useCallback, ReactElement, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { FOLDERS, useFolder, hasId } from '@zextras/carbonio-ui-commons';
import { BaseFolder } from '@zextras/carbonio-ui-soap-lib';

import { CreateCalendarModal } from './create-calendar-modal';
import { MoveModal } from './move-modal';
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

	const moveAppt = useCallback(
		(data: any): void => {
			dispatch(moveAppointmentRequest(data)).then((res: any) => {
				if (res.type.includes('fulfilled')) {
					createSnackbar({
						key: hasId(event.resource.calendar, FOLDERS.TRASH) ? 'restore' : 'move',
						replace: true,
						severity: 'info',
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
						severity: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
			});
		},
		[createSnackbar, dispatch, event.resource.calendar]
	);

	const onCreated = useCallback(
		(response: BaseFolder) => {
			moveAppt({
				inviteId: event.resource.inviteId,
				l: response.id,
				destinationCalendarName: response.name,
				id: event.resource.id
			});
			event && hasId(event.resource.calendar, FOLDERS.TRASH)
				? t('folder.modal.restore.footer', 'Create and Restore')
				: t('label.create', 'Create');
		},
		[event, moveAppt]
	);
	const confirmLabel = useMemo(
		() =>
			event && hasId(event.resource.calendar, FOLDERS.TRASH)
				? t('folder.modal.restore.footer', 'Create and Restore')
				: t('label.create', 'Create'),
		[event]
	);
	return currentFolder ? (
		<>
			{showNewFolderModal ? (
				<CreateCalendarModal
					toggleModal={toggleModal}
					onClose={onClose}
					folderId={currentFolder.id}
					onCreated={onCreated}
					confirmLabel={confirmLabel}
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
