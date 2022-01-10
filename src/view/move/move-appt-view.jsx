/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useMemo, useCallback } from 'react';
import { filter } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { NewModal } from './new-calendar-modal';
import MoveModal from './move-modal';
import { selectCalendars } from '../../store/selectors/calendars';

export default function MoveAppointment({ onClose, event, createSnackbar, action }) {
	const dispatch = useDispatch();
	const folders = useSelector(selectCalendars);
	const currentFolder = useMemo(
		() => filter(folders, (f) => f.id === `${event.resource.calendar.id}`),
		[folders, event.resource.calendar.id]
	);
	const [showNewFolderModal, setShowNewFolderModal] = useState(false);
	const [t] = useTranslation();

	const toggleModal = useCallback(
		() => setShowNewFolderModal(!showNewFolderModal),
		[showNewFolderModal]
	);

	return (
		<>
			{showNewFolderModal ? (
				<NewModal
					toggleModal={toggleModal}
					onClose={onClose}
					currentFolder={currentFolder}
					folders={folders}
					dispatch={dispatch}
					t={t}
					event={event}
					action={action}
					createSnackbar={createSnackbar}
				/>
			) : (
				<MoveModal
					toggleModal={toggleModal}
					onClose={onClose}
					currentFolder={currentFolder}
					folders={folders}
					dispatch={dispatch}
					t={t}
					event={event}
					action={action}
					createSnackbar={createSnackbar}
				/>
			)}
		</>
	);
}
