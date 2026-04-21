/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, useState } from 'react';

import { Container, Input, Padding, useSnackbar } from '@zextras/carbonio-design-system';
import { useFolder, useFoldersMap } from '@zextras/carbonio-ui-commons';
import { includes, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from 'commons/modal-header';
import { FOLDER_OPERATIONS } from 'constants/api';
import { folderAction } from 'store/actions/calendar-actions';

type EditCaldavCalendarModalProps = {
	folderId: string;
	onClose: () => void;
};

export const EditCaldavCalendarModal = ({
	folderId,
	onClose
}: EditCaldavCalendarModalProps): JSX.Element => {
	const [t] = useTranslation();
	const folder = useFolder(folderId);
	const folders = useFoldersMap();
	const createSnackbar = useSnackbar();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [calendarName, setCalendarName] = useState(folder?.name ?? '');
	const normalizedCurrentName = (folder?.name ?? '').trim().toLowerCase();

	const appointmentFolderNames = useMemo(
		() =>
			map(folders, (f) =>
				f.view === 'appointment' && f.id !== folderId ? f.name.trim().toLowerCase() : null
			),
		[folders, folderId]
	);

	const isDuplicateCalendarName = useMemo(() => {
		const normalizedInputName = calendarName.trim().toLowerCase();
		if (normalizedInputName === normalizedCurrentName) {
			return false;
		}

		return includes(appointmentFolderNames, normalizedInputName);
	}, [appointmentFolderNames, calendarName, normalizedCurrentName]);

	const onConfirm = (): void => {
		if (!folder || isSubmitting) {
			return;
		}

		const trimmedName = calendarName.trim();
		if (!trimmedName || isDuplicateCalendarName) {
			return;
		}

		if (trimmedName === folder.name) {
			onClose();
			return;
		}

		setIsSubmitting(true);
		folderAction({ op: FOLDER_OPERATIONS.RENAME, name: trimmedName, id: folderId })
			.then((res: { Fault?: string }) => {
				if (res.Fault) {
					createSnackbar({
						key: 'edit-caldav-calendar-error',
						replace: true,
						severity: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
					setIsSubmitting(false);
					return;
				}

				createSnackbar({
					key: 'edit-caldav-calendar-success',
					replace: true,
					severity: 'success',
					hideButton: true,
					label: t('label.changes_saved', 'Changes saved'),
					autoHideTimeout: 3000
				});
				onClose();
			})
			.catch(() => {
				setIsSubmitting(false);
				createSnackbar({
					key: 'edit-caldav-calendar-error',
					replace: true,
					severity: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			});
	};

	return (
		<Container
			data-testid={'edit-caldav-calendar-modal'}
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader onClose={onClose} title={t('action.edit_name', 'Edit name')} />
			<Padding top="medium" />
			<Input
				label={`${t('label.calendars_name', "Calendars' name")}*`}
				background={'gray5'}
				hasError={isDuplicateCalendarName}
				description={
					isDuplicateCalendarName
						? t(
								'add_ics_from_url.error.duplicate_calendar_name',
								'A calendar with the same name already exists'
							)
						: undefined
				}
				value={calendarName}
				disabled={isSubmitting}
				onChange={(event): void => setCalendarName(event.target.value)}
			/>
			<Padding top="medium" />
			<ModalFooter
				onConfirm={onConfirm}
				label={t('label.save_changes', 'Save Changes')}
				disabled={!calendarName.trim() || isSubmitting || isDuplicateCalendarName}
			/>
		</Container>
	);
};
