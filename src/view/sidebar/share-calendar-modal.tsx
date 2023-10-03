/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useContext, useMemo, useState } from 'react';

import {
	Checkbox,
	ChipInput,
	ChipItem,
	Container,
	Input,
	Row,
	Select,
	SnackbarManagerContext,
	Text
} from '@zextras/carbonio-design-system';
import { t, useIntegratedComponent, useUserAccounts } from '@zextras/carbonio-shell-ui';
import { isNil, map, some } from 'lodash';

import ModalFooter from '../../carbonio-ui-commons/components/modals/modal-footer';
import ModalHeader from '../../carbonio-ui-commons/components/modals/modal-header';
import {
	ShareCalendarRoleOptions,
	ShareCalendarWithOptions,
	findLabel
} from '../../settings/components/utils';
import { folderAction } from '../../store/actions/calendar-actions';
import { sendShareCalendarNotification } from '../../store/actions/send-share-calendar-notification';
import { useAppDispatch } from '../../store/redux/hooks';
import { ShareCalendarModalProps } from '../../types/share-calendar';

export const ShareCalendarModal: FC<ShareCalendarModalProps> = ({
	folderName,
	folderId,
	closeFn,
	onGoBack,
	secondaryLabel,
	grant
}): ReactElement => {
	const dispatch = useAppDispatch();
	const createSnackbar = useContext(SnackbarManagerContext);

	const [ContactInput, integrationAvailable] = useIntegratedComponent('contact-input');
	const shareCalendarWithOptions = useMemo(() => ShareCalendarWithOptions(), []);
	const shareCalendarRoleOptions = useMemo(
		() => ShareCalendarRoleOptions(grant?.[0]?.perm?.includes('p')),
		[grant]
	);

	const [sendNotification, setSendNotification] = useState(true);
	const [standardMessage, setStandardMessage] = useState('');
	const [contacts, setContacts] = useState<any>([]);
	const [shareWithUserType, setshareWithUserType] = useState('usr');
	const [shareWithUserRole, setshareWithUserRole] = useState('r');
	const [allowToSeePrvtAppt, setAllowToSeePrvtAppt] = useState(false);
	const accounts = useUserAccounts();

	const chipsHaveErrors = useMemo(() => some(contacts, 'error'), [contacts]);
	const title = useMemo(() => `${t('label.share', 'Share')} ${folderName}`, [folderName]);

	const onShareWithChange = useCallback((shareWith) => {
		setshareWithUserType(shareWith);
	}, []);

	const onShareRoleChange = useCallback((shareRole) => {
		setshareWithUserRole(shareRole);
	}, []);

	const onConfirm = (): void => {
		const granted = map(contacts, (contact) => ({
			gt: 'usr',
			inh: '1',
			d: contact.email,
			perm: `${shareWithUserRole}${allowToSeePrvtAppt ? 'p' : ''}`,
			pw: ''
		}));
		folderAction({ id: folderId, op: 'grant', changes: { grant: granted } }).then((res) => {
			if (!res.Fault) {
				createSnackbar({
					key: `folder-action-success`,
					replace: true,
					type: 'success',
					hideButton: true,
					label: t('snackbar.share_folder_success', 'Calendar shared successfully'),
					autoHideTimeout: 3000
				});
				sendNotification &&
					dispatch(
						sendShareCalendarNotification({
							sendNotification,
							standardMessage,
							contacts,
							shareWithUserType,
							shareWithUserRole,
							folder: folderId,
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
		closeFn && closeFn();
	};

	const onChange = useCallback((ev) => {
		setContacts(ev);
	}, []);

	return (
		<Container data-testid="ShareCalendarModal" padding="0.5rem 0.5rem 1.5rem">
			<ModalHeader onClose={closeFn} title={title} />
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Select
					items={shareCalendarWithOptions}
					background={'gray5'}
					label={t('label.share_with', 'Share with')}
					disablePortal
					onChange={onShareWithChange}
					defaultSelection={{
						value: 'usr',
						label: findLabel(shareCalendarWithOptions, 'usr')
					}}
				/>
			</Container>
			{shareWithUserType === 'usr' && (
				<>
					<Container
						padding={{ top: 'small', bottom: 'small' }}
						mainAlignment="center"
						crossAlignment="flex-start"
						height="fit"
					>
						{integrationAvailable ? (
							<ContactInput
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								placeholder={t(
									'share.placeholder.recipients_address',
									'Recipients e-mail addresses'
								)}
								onChange={onChange}
								background={'gray5'}
								defaultValue={contacts}
							/>
						) : (
							<ChipInput
								placeholder={t(
									'share.placeholder.recipients_address',
									'Recipients e-mail addresses'
								)}
								hasError
								background={'gray4'}
								onChange={(ev: ChipItem<any>[]): void => {
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-ignore
									setContacts(map(ev, (contact) => ({ email: contact.address })));
								}}
							/>
						)}
					</Container>
					<Container
						padding={{ top: 'small', bottom: 'small' }}
						mainAlignment="center"
						crossAlignment="flex-start"
						height="fit"
						data-testid={'privateCheckboxContainer'}
					>
						<Checkbox
							value={allowToSeePrvtAppt}
							defaultChecked={allowToSeePrvtAppt}
							onClick={(): void => setAllowToSeePrvtAppt(!allowToSeePrvtAppt)}
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
							items={shareCalendarRoleOptions}
							background={'gray5'}
							label={t('label.role', 'Role')}
							onChange={onShareRoleChange}
							disablePortal
							defaultSelection={{
								value: 'r',
								label: findLabel(shareCalendarRoleOptions, 'r')
							}}
						/>
					</Container>
					<Container
						padding={{ top: 'small', bottom: 'small' }}
						mainAlignment="center"
						crossAlignment="flex-start"
						height="fit"
						data-testid={'sendNotificationCheckboxContainer'}
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
				</>
			)}
			<ModalFooter
				onConfirm={onConfirm}
				label={t('action.share_calendar', 'Share Calendar')}
				disabled={
					(!isNil(shareWithUserType) && shareWithUserType !== 'pub' && contacts?.length < 1) ||
					chipsHaveErrors
				}
				secondaryAction={onGoBack}
				secondaryLabel={secondaryLabel}
			/>
		</Container>
	);
};
