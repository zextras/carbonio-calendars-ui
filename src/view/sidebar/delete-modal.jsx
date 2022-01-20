/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useContext, useMemo } from 'react';
import { Container, SnackbarManagerContext, Text } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { folderAction } from '../../store/actions/calendar-actions';
import { ModalHeader } from '../../commons/modal-header';
import ModalFooter from '../../commons/modal-footer';

export const DeleteModal = ({ folder, onClose }) => {
	const createSnackbar = useContext(SnackbarManagerContext);
	const dispatch = useDispatch();
	const [t] = useTranslation();
	const onConfirm = () => {
		onClose();
		const restoreEvent = () => {
			dispatch(folderAction({ id: folder.id, op: 'move', changes: folder })).then((res) => {
				if (res.type.includes('fulfilled')) {
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
		};
		dispatch(
			folderAction({ id: folder.id, op: folder.parent === FOLDERS.USER_ROOT ? 'trash' : 'delete' })
		).then((res) => {
			if (res.type.includes('fulfilled')) {
				createSnackbar({
					key: 'send',
					replace: true,
					type: 'info',
					label:
						folder.parent === FOLDERS.USER_ROOT
							? t('message.snackbar.calendar_moved_to_trash', 'Calendar moved to trash')
							: t('message.snackbar.calendar_permanently_deleted', 'Calendar permanently deleted'),
					autoHideTimeout: 5000,
					hideButton: folder.parent !== FOLDERS.USER_ROOT,
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
	};
	const title = useMemo(() => t('label.delete', 'Delete'), [t]);
	return folder ? (
		<Container padding="8px 8px 24px">
			<ModalHeader title={title} onClose={onClose} />
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Text overflow="break-word">
					{folder.parent === FOLDERS.USER_ROOT ? (
						<Trans
							i18nKey="message.you_sure_move_calendar_trash"
							defaults={'Are you sure you want to  delete the "{{name}}" calendar?'}
							values={{ name: folder.name }}
						/>
					) : (
						<Trans
							i18nKey="message.you_sure_delete_calendar"
							defaults={'Are you sure you want to permanently delete the "{{name}}" calendar?'}
							values={{ name: folder.name }}
						/>
					)}
				</Text>
			</Container>
			<ModalFooter
				onConfirm={onConfirm}
				onClose={onClose}
				label={t('label.delete', 'Delete')}
				color="error"
			/>
		</Container>
	) : null;
};
