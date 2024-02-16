/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState, FC, ReactElement } from 'react';

import {
	Checkbox,
	Container,
	Input,
	Row,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useUserAccounts, Grant } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { GranteeChip } from './grantee-chip';
import { Folder } from '../../../../carbonio-ui-commons/types/folder';
import { useEditModalContext } from '../../../../commons/edit-modal-context';
import ModalFooter from '../../../../commons/modal-footer';
import { ModalHeader } from '../../../../commons/modal-header';
import { PUBLIC_SHARE_ZID, SHARE_USER_TYPE } from '../../../../constants';
import { FOLDER_OPERATIONS } from '../../../../constants/api';
import { folderAction } from '../../../../store/actions/calendar-actions';
import { sendShareCalendarNotification } from '../../../../store/actions/send-share-calendar-notification';
import { useAppDispatch } from '../../../../store/redux/hooks';

type ShareRevokeModalProps = {
	folder: Folder;
	grant: Grant;
	onGoBack: () => void;
};

export const ShareRevokeModal: FC<ShareRevokeModalProps> = ({
	folder,
	grant,
	onGoBack
}): ReactElement => {
	const [t] = useTranslation();
	const [sendNotification, setSendNotification] = useState(false);
	const [standardMessage, setStandardMessage] = useState('');
	const { onClose } = useEditModalContext();
	const accounts = useUserAccounts();
	const dispatch = useAppDispatch();
	const createSnackbar = useSnackbar();

	const tooltipLabel = useMemo(() => {
		if (sendNotification && standardMessage !== '') {
			return t('revoke_with_custom_message', 'Revoke access sending a custom notification');
		}
		if (sendNotification && standardMessage === '') {
			return t('revoke_without_custom_message', 'Revoke access sending a standard notification');
		}
		return t('revoke_without_notification', 'Revoke access without sending a notification');
	}, [sendNotification, standardMessage, t]);

	const onConfirm = useCallback(() => {
		folderAction({
			id: folder.id,
			zid: grant.gt === SHARE_USER_TYPE.PUBLIC ? PUBLIC_SHARE_ZID : grant.zid,
			op: FOLDER_OPERATIONS.REVOKE_GRANT
		}).then((res) => {
			if (!res.Fault) {
				sendNotification &&
					dispatch(
						sendShareCalendarNotification({
							sendNotification,
							standardMessage,
							contacts: [{ email: grant.d }],
							folder: folder.id,
							accounts
						})
					);
				createSnackbar({
					key: `folder-action-success`,
					replace: true,
					type: 'info',
					hideButton: true,
					label: t('label.access_revoked', 'Access revoked'),
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
			onGoBack();
		});
	}, [
		accounts,
		createSnackbar,
		dispatch,
		folder.id,
		grant.d,
		grant.gt,
		grant.zid,
		onGoBack,
		sendNotification,
		standardMessage,
		t
	]);

	return (
		<Container data-testid="RevokeModal" padding="0.5rem 0.5rem 1.5rem">
			<ModalHeader
				title={t('label.revoke_share', {
					title: folder.name,
					defaultValue: 'Revoke share of {{title}}'
				})}
				onClose={onClose}
			/>
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<GranteeChip grant={grant} />
			</Container>
			{grant.gt !== SHARE_USER_TYPE.PUBLIC && (
				<>
					<Container
						padding={{ top: 'small', bottom: 'small' }}
						mainAlignment="center"
						crossAlignment="flex-start"
						height="fit"
					>
						<Checkbox
							iconSize="medium"
							value={sendNotification}
							defaultChecked={sendNotification}
							onClick={(): void => setSendNotification(!sendNotification)}
							label={t('share.label.send_notification', 'Send notification about this share')}
						/>
					</Container>
					<Container
						padding={{ top: 'small', bottom: 'small' }}
						mainAlignment="center"
						crossAlignment="flex-start"
						height="fit"
					>
						<Input
							label={t('share.placeholder.standard_message', 'Add a note to standard message')}
							value={standardMessage}
							onChange={(ev): void => {
								setStandardMessage(ev.target.value);
							}}
							disabled={!sendNotification}
							backgroundColor="gray5"
						/>
					</Container>
					<Container
						padding={{ top: 'small', bottom: 'small' }}
						mainAlignment="center"
						crossAlignment="flex-start"
						height="fit"
						orientation="horizontal"
					>
						<Row padding={{ right: 'small' }}>
							<Text weight="bold" size="small">
								Note:
							</Text>
						</Row>
						<Row>
							<Text overflow="break-word" size="small" color="secondary">
								{t(
									'share.note.share_note',
									'The standard message displays your name, the name of the shared item, pemissions granted to the recipients, and sign in information.'
								)}
							</Text>
						</Row>
					</Container>
				</>
			)}
			<ModalFooter
				color="error"
				onConfirm={onConfirm}
				secondaryAction={onGoBack}
				secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
				label={t('label.revoke', 'Revoke')}
				tooltip={tooltipLabel}
			/>
		</Container>
	);
};
