/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo } from 'react';

import { Container, Text, useSnackbar } from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';

import ModalFooter from '../../carbonio-ui-commons/components/modals/modal-footer';
import ModalHeader from '../../carbonio-ui-commons/components/modals/modal-header';
import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { isNestedInTrash } from '../../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder } from '../../carbonio-ui-commons/types';
import { hasId } from '../../carbonio-ui-commons/worker/handle-message';
import { FOLDER_OPERATIONS } from '../../constants/api';
import { folderAction } from '../../store/actions/calendar-actions';
import { deleteCalendarAction } from '../../store/actions/delete-calendar-action';
import { FolderAction } from '../../types/soap/soap-actions';

export const DeleteModal: FC<{ folder: Folder; onClose: () => void }> = ({ folder, onClose }) => {
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();

	const restoreEvent = useCallback((): void => {
		folderAction({ id: folder.id, op: FOLDER_OPERATIONS.MOVE, l: folder.l }).then((res) => {
			if (!res.Fault) {
				createSnackbar({
					key: 'send',
					replace: true,
					type: 'success',
					label: t('message.snackbar.calendar_restored', 'Calendar restored successfully'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			} else {
				createSnackbar({
					key: 'send',
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			}
		});
	}, [createSnackbar, folder.id, folder.l, t]);

	function handleDeletion(
		act: (folderAction: Array<FolderAction> | FolderAction) => Promise<any>,
		operation: {
			type: typeof FOLDER_OPERATIONS.DELETE | typeof FOLDER_OPERATIONS.TRASH;
			label: string;
		}
	): void {
		act({
			id: folder.id,
			op: operation.type
		}).then((res) => {
			if (!res.Fault) {
				createSnackbar({
					key: 'send',
					replace: true,
					type: 'info',
					label: operation.label,
					autoHideTimeout: 5000,
					hideButton: folder ? hasId(folder, FOLDERS.USER_ROOT) : true,
					actionLabel: t('label.undo', 'Undo'),
					onActionClick: () => restoreEvent()
				});
			} else {
				createSnackbar({
					key: 'send',
					replace: true,
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			}
		});
	}

	const onConfirm = (): void => {
		onClose();

		isNestedInTrash(folder)
			? handleDeletion(deleteCalendarAction, {
					type: FOLDER_OPERATIONS.DELETE,
					label: t('message.snackbar.calendar_permanently_deleted', 'Calendar permanently deleted')
				})
			: handleDeletion(folderAction, {
					type: FOLDER_OPERATIONS.TRASH,
					label: t('message.snackbar.calendar_moved_to_trash', 'Calendar moved to trash')
				});
	};

	const title = useMemo(() => t('label.delete', 'Delete'), [t]);

	return folder ? (
		<Container padding="0.5rem 0.5rem 1.5rem">
			<ModalHeader title={title} onClose={onClose} />
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Text overflow="break-word">
					{isNestedInTrash(folder) ? (
						<Trans
							i18nKey="message.you_sure_delete_calendar"
							defaults={'Are you sure you want to permanently delete the "{{name}}" calendar?'}
							values={{ name: folder.name }}
						/>
					) : (
						<Trans
							i18nKey="message.you_sure_move_calendar_trash"
							defaults={'Are you sure you want to  delete the "{{name}}" calendar?'}
							values={{ name: folder.name }}
						/>
					)}
				</Text>
			</Container>
			<ModalFooter onConfirm={onConfirm} label={t('label.delete', 'Delete')} color="error" />
		</Container>
	) : null;
};
