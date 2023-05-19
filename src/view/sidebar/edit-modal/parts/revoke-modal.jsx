/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useUserAccounts } from '@zextras/carbonio-shell-ui';
import {
	Checkbox,
	Container,
	Input,
	Row,
	SnackbarManagerContext,
	Text
} from '@zextras/carbonio-design-system';
import { sendShareCalendarNotification } from '../../../../store/actions/send-share-calendar-notification';
import { folderAction } from '../../../../store/actions/calendar-actions';
import { ModalHeader } from '../../../../commons/modal-header';
import ModalFooter from '../../../../commons/modal-footer';
import { GranteeInfo } from './grantee-info';
import { EditModalContext } from '../../../../commons/edit-modal-context';
import { useAppDispatch } from '../../../../store/redux/hooks';

export const ShareRevokeModal = ({ folder, grant, onGoBack }) => {
	const [t] = useTranslation();
	const [sendNotification, setSendNotification] = useState(false);
	const [standardMessage, setStandardMessage] = useState('');
	const { onClose } = useContext(EditModalContext);
	const accounts = useUserAccounts();
	const dispatch = useAppDispatch();
	const createSnackbar = useContext(SnackbarManagerContext);

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
		folderAction({ id: folder.id, zid: grant.zid, op: '!grant' }).then((res) => {
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
		folder,
		grant.d,
		grant.zid,
		onGoBack,
		sendNotification,
		standardMessage,
		t
	]);

	return (
		<Container padding="0.5rem 0.5rem 1.5rem">
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
				<GranteeInfo grant={grant} />
			</Container>
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
					onClick={() => setSendNotification(!sendNotification)}
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
					onChange={(ev) => {
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
			<ModalFooter
				color="error"
				onConfirm={onConfirm}
				secondaryAction={onGoBack}
				secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
				label={t('label.revoke', 'Revoke')}
				t={t}
				tooltip={tooltipLabel}
			/>
		</Container>
	);
};
