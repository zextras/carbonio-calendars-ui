/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState } from 'react';

import { Container, Text, useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from 'commons/modal-header';

type DeleteCaldavCalendarModalProps = {
	folder: { id: string; name: string };
	onClose: () => void;
	onConfirm: () => Promise<void>;
};

export const DeleteCaldavCalendarModal: FC<DeleteCaldavCalendarModalProps> = ({
	folder,
	onClose,
	onConfirm
}) => {
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleConfirm = (): void => {
		if (isSubmitting) {
			return;
		}
		setIsSubmitting(true);
		onConfirm()
			.then(() => {
				createSnackbar({
					key: 'delete-caldav-calendar-success',
					replace: true,
					severity: 'success',
					hideButton: true,
					label: t('message.snackbar.caldav_calendars_permanently_deleted', 'Calendars permanently deleted'),
					autoHideTimeout: 3000
				});
				onClose();
			})
			.catch(() => {
				setIsSubmitting(false);
				createSnackbar({
					key: 'delete-caldav-calendar-error',
					replace: true,
					severity: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			});
	};

	return (
		<Container padding={{ all: 'small' }}>
			<ModalHeader
				title={t('message.delete_external_host_permanently', {
					name: folder.name,
					defaultValue: "Delete '{{name}}' permanently"
				})}
				onClose={onClose}
			/>
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Text overflow="break-word">
					{t('message.you_sure_delete_external_host_calendars', {
						name: folder.name,
						defaultValue:
							"Are you sure you want to permanently delete all the external calendars inside '{{name}}'? This action is irreversible."
					})}
				</Text>
			</Container>
			<ModalFooter
				onConfirm={handleConfirm}
				label={t('label.yes_delete', 'YES, DELETE')}
				color="error"
				disabled={isSubmitting}
			/>
		</Container>
	);
};
