/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Text, Container, Padding, useSnackbar } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { FOLDER_OPERATIONS } from '../../constants/api';
import { folderAction } from '../../store/actions/new-calendar-actions';

export const EmptyModal = ({
	onClose,
	folderId
}: {
	onClose: () => void;
	folderId: string;
}): JSX.Element => {
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();

	const onConfirm = (): void => {
		folderAction([{ id: folderId, op: FOLDER_OPERATIONS.EMPTY, recursive: true }]).then((res) => {
			onClose();
			if (!res.Fault) {
				createSnackbar({
					key: `folder-action-success`,
					replace: true,
					type: 'info',
					hideButton: true,
					label: t('label.trash_emptied', 'Trash emptied successfully'),
					autoHideTimeout: 3000
				});
			} else {
				createSnackbar({
					key: `folder-action-success`,
					replace: true,
					type: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			}
		});
	};

	return (
		<Container
			padding={{ all: 'large' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader onClose={onClose} title={t('action.empty_trash', 'Empty Trash')} />
			<Padding all="small">
				<Text overflow="break-word">
					{t(
						'action.empty_trash_confirmation',
						'This action will delete all items in E-mail, Contacts, Calendar, Tasks and Briefcase trash folders. Are you sure that you want to permanently delete everything in these trash folders?'
					)}
				</Text>
			</Padding>
			<ModalFooter
				onConfirm={onConfirm}
				secondaryAction={onClose}
				label={t('label.empty', 'Empty')}
				color="error"
			/>
		</Container>
	);
};
