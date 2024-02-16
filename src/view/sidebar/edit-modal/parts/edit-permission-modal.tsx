/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState, FC } from 'react';

import {
	Checkbox,
	Container,
	Input,
	Row,
	Select,
	Text,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useUserAccounts } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { GranteeChip } from './grantee-chip';
import { Folder, Grant } from '../../../../carbonio-ui-commons/types/folder';
import { useEditModalContext } from '../../../../commons/edit-modal-context';
import ModalFooter from '../../../../commons/modal-footer';
import { ModalHeader } from '../../../../commons/modal-header';
import { SHARE_USER_TYPE } from '../../../../constants';
import { FOLDER_OPERATIONS } from '../../../../constants/api';
import { findLabel } from '../../../../settings/components/utils';
import { folderAction } from '../../../../store/actions/calendar-actions';
import { sendShareCalendarNotification } from '../../../../store/actions/send-share-calendar-notification';
import { useAppDispatch } from '../../../../store/redux/hooks';

type EditPermissionModalProps = {
	folder: Folder;
	grant: Grant;
	onGoBack: () => void;
};

export const EditPermissionModal: FC<EditPermissionModalProps> = ({ folder, grant, onGoBack }) => {
	const [t] = useTranslation();
	const [sendNotification, setSendNotification] = useState(false);
	const [standardMessage, setStandardMessage] = useState('');
	const { onClose, roleOptions } = useEditModalContext();
	const accounts = useUserAccounts();
	const dispatch = useAppDispatch();
	const createSnackbar = useSnackbar();
	const [shareWithUserRole, setShareWithUserRole] = useState('');
	const [allowToSeePrivateAppointment, setAllowToSeePrivateAppointment] = useState(false);

	const onConfirm = (): void => {
		const grants = [
			{
				gt: SHARE_USER_TYPE.USER,
				inh: '1',
				d: grant.d || grant.zid,
				perm: `${shareWithUserRole}${allowToSeePrivateAppointment ? 'p' : ''}`,
				pw: ''
			}
		];
		folderAction({ id: folder.id, op: FOLDER_OPERATIONS.GRANT, grant: grants }).then((res) => {
			if (!res?.Fault) {
				createSnackbar({
					key: `folder-action-success`,
					replace: true,
					type: 'success',
					hideButton: true,
					label: t('label.calendar_shared', 'Calendar shared successfully'),
					autoHideTimeout: 3000
				});
				sendNotification &&
					dispatch(
						sendShareCalendarNotification({
							sendNotification,
							standardMessage,
							contacts: [{ email: grant.d || grant.zid }],
							shareWithUserRole,
							folder: folder.id,
							accounts
						})
					).then((res2) => {
						if (!res2.type.includes('fulfilled')) {
							createSnackbar({
								key: `folder-action-failed`,
								replace: true,
								type: 'error',
								hideButton: true,
								label: t('label.error_try_again', 'Something went wrong, please try again'),
								autoHideTimeout: 3000
							});
						}
					});
			}
		});
		onGoBack();
	};

	const onShareRoleChange = useCallback((shareRole) => {
		setShareWithUserRole(shareRole);
	}, []);

	const title = useMemo(() => t('label.edit_access', 'Edit access'), [t]);
	return (
		<Container data-testid="EditPermissionModal" padding="0.5rem 0.5rem 1.5rem">
			<ModalHeader title={title} onClose={onClose} />
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<GranteeChip grant={grant} />
			</Container>
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Checkbox
					value={allowToSeePrivateAppointment}
					defaultChecked={allowToSeePrivateAppointment}
					onClick={(): void => setAllowToSeePrivateAppointment((prevValue) => !prevValue)}
					label={t(
						'share.label.allow_to_see_private_appt',
						'Allow user(s) to see my private appointments'
					)}
				/>
			</Container>
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Select
					items={roleOptions}
					background={'gray5'}
					label={t('label.role', 'Role')}
					onChange={onShareRoleChange}
					disablePortal
					defaultSelection={{
						value: grant.perm,
						label: findLabel(roleOptions, grant.perm)
					}}
				/>
			</Container>
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Checkbox
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
					backgroundColor="gray5"
					disabled={!sendNotification}
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
				onConfirm={onConfirm}
				secondaryAction={onGoBack}
				secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
				label={t('label.edit_share', 'Edit share')}
			/>
		</Container>
	);
};
