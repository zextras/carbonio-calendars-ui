/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState } from 'react';

import { Container, Text, useSnackbar } from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';

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
					label: t('message.snackbar.calendar_permanently_deleted', 'Calendar permanently deleted'),
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
			<ModalHeader title={t('label.delete_permanently', 'Delete permanently')} onClose={onClose} />
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Text overflow="break-word">
					<Trans
						i18nKey="message.you_sure_delete_calendar"
						defaults={'Are you sure you want to permanently delete the "{{name}}" calendar?'}
						values={{ name: folder.name }}
					/>
				</Text>
			</Container>
			<ModalFooter
				onConfirm={handleConfirm}
				label={t('label.delete', 'Delete')}
				color="error"
				disabled={isSubmitting}
			/>
		</Container>
	);
};
