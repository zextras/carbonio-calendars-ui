/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState } from 'react';

import { Container, Input, Padding, useSnackbar } from '@zextras/carbonio-design-system';
import { useFolder } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import {
	showChangesSavedSnackbar,
	showErrorTryAgainSnackbar,
	useDuplicateCalendarNameValidation
} from './edit-caldav-modal-helpers';
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
	const createSnackbar = useSnackbar();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [calendarName, setCalendarName] = useState(folder?.name ?? '');
	const normalizedCurrentName = (folder?.name ?? '').trim().toLowerCase();

	const isDuplicateCalendarName = useDuplicateCalendarNameValidation({
		folderId,
		calendarName,
		normalizedCurrentName
	});

	const onConfirm = (): void => {
		if (!folder || isSubmitting) {
			return;
		}

		const trimmedName = calendarName.trim();
		if (!trimmedName || isDuplicateCalendarName) {
			return;
		}

		if (trimmedName === folder.name) {
			showChangesSavedSnackbar(createSnackbar, 'edit-caldav-calendar-success', t);
			onClose();
			return;
		}

		setIsSubmitting(true);
		folderAction({ op: FOLDER_OPERATIONS.RENAME, name: trimmedName, id: folderId })
			.then((res: { Fault?: string }) => {
				if (res.Fault) {
					showErrorTryAgainSnackbar(createSnackbar, 'edit-caldav-calendar-error', t);
					setIsSubmitting(false);
					return;
				}

				showChangesSavedSnackbar(createSnackbar, 'edit-caldav-calendar-success', t);
				onClose();
			})
			.catch(() => {
				setIsSubmitting(false);
				showErrorTryAgainSnackbar(createSnackbar, 'edit-caldav-calendar-error', t);
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
