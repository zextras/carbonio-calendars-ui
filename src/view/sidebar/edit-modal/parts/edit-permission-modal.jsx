/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useUserAccounts } from '@zextras/carbonio-shell-ui';
import { useDispatch } from 'react-redux';
import {
	Checkbox,
	Container,
	Input,
	Row,
	Select,
	SnackbarManagerContext,
	Text
} from '@zextras/carbonio-design-system';
import { replace, split } from 'lodash';
import { EditModalContext } from '../../../../commons/edit-modal-context';
import { sendShareCalendarNotification } from '../../../../store/actions/send-share-calendar-notification';
import { ModalHeader } from '../../../../commons/modal-header';
import { GranteeInfo } from './grantee-info';
import ModalFooter from '../../../../commons/modal-footer';
import { findLabel } from '../../../../settings/components/utils';
import { shareCalendar } from '../../../../store/actions/share-calendar';

export const EditPermissionModal = ({ folder, grant, onGoBack }) => {
	const [t] = useTranslation();
	const [sendNotification, setSendNotification] = useState(false);
	const [standardMessage, setStandardMessage] = useState('');
	const { onClose, roleOptions } = useContext(EditModalContext);
	const accounts = useUserAccounts();
	const dispatch = useDispatch();
	const createSnackbar = useContext(SnackbarManagerContext);
	const [shareWithUserRole, setshareWithUserRole] = useState('');
	const [allowToSeePrvtAppt, setAllowToSeePrvtAppt] = useState(false);

	const onConfirm = () => {
		dispatch(
			shareCalendar({
				sendNotification,
				standardMessage,
				contacts: [{ email: grant.d }],
				shareWithUserRole,
				folder: folder.id,
				accounts,
				allowToSeePrvtAppt,
				grant
			})
		).then((res) => {
			if (res.type.includes('fulfilled')) {
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
							contacts: [{ email: grant.d }],
							shareWithUserRole,
							folder: folder.id,
							accounts
						})
					).then((res2) => {
						if (!res2.type.includes('fulfilled')) {
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
			}
		});
		onGoBack();
	};

	const onShareRoleChange = useCallback((shareRole) => {
		setshareWithUserRole(shareRole);
	}, []);

	const label = useMemo(() => replace(split(grant.d, '@')?.[0], '.', ' '), [grant.d]);
	return (
		<Container padding="8px 8px 24px">
			<ModalHeader
				title={t('label.edit_access', { name: label, defaultValue: "Edit {{name}}'s access" })}
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
					value={allowToSeePrvtAppt}
					defaultChecked={allowToSeePrvtAppt}
					onClick={() => setAllowToSeePrvtAppt(!allowToSeePrvtAppt)}
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
					background="gray5"
					label="Role"
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
					background="gray5"
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
				t={t}
			/>
		</Container>
	);
};
