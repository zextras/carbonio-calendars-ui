/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useMemo, useState } from 'react';

import {
	Checkbox,
	ChipInput,
	ChipItem,
	Container,
	Icon,
	Input,
	Padding,
	Row,
	Select,
	Text,
	Tooltip,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useIntegratedComponent, useUserAccounts } from '@zextras/carbonio-shell-ui';
import { map, some } from 'lodash';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../carbonio-ui-commons/components/modals/modal-footer';
import ModalHeader from '../../carbonio-ui-commons/components/modals/modal-header';
import { SHARE_USER_TYPE } from '../../constants';
import { FOLDER_OPERATIONS } from '../../constants/api';
import {
	ShareCalendarRoleOptions,
	ShareCalendarWithOptions,
	findLabel
} from '../../settings/components/utils';
import { folderAction } from '../../store/actions/calendar-actions';
import { sendShareCalendarNotification } from '../../store/actions/send-share-calendar-notification';
import { useAppDispatch } from '../../store/redux/hooks';
import { ShareCalendarModalProps } from '../../types/share-calendar';

type SharePrivateCheckboxProps = {
	allowToSeePrvtAppt: boolean;
	setAllowToSeePrvtAppt: React.Dispatch<React.SetStateAction<boolean>>;
};
type Contact = {
	email: string;
	error?: boolean;
};

type Contacts = Array<Contact>;

export type ShareUserType = (typeof SHARE_USER_TYPE)[keyof typeof SHARE_USER_TYPE];

export const SharePrivateCheckbox: FC<SharePrivateCheckboxProps> = ({
	allowToSeePrvtAppt,
	setAllowToSeePrvtAppt
}): ReactElement => {
	const [t] = useTranslation();
	const privateInfoTooltipLabel = useMemo(
		() =>
			t(
				'private_info_tooltip',
				"When sharing a calendar, other users can see your appointment details (title, description, and attendees) except for the ones marked as private. In this case, other users will see your free/busy time but not the appointment details. Would you like other users to display also your private appointments' detail?"
			),
		[t]
	);
	return (
		<Container
			padding={{ top: 'small', bottom: 'small' }}
			mainAlignment="flex-start"
			crossAlignment="center"
			height="fit"
			data-testid={'privateCheckboxContainer'}
			orientation="horizontal"
		>
			<Checkbox
				value={allowToSeePrvtAppt}
				defaultChecked={allowToSeePrvtAppt}
				onClick={(): void => setAllowToSeePrvtAppt((prevValue) => !prevValue)}
				label={t(
					'share.label.allow_to_see_private_appt',
					'Allow user(s) to see private appointments’ detail'
				)}
			/>
			<Tooltip label={privateInfoTooltipLabel}>
				<Padding left="small">
					<Icon icon="InfoOutline" />
				</Padding>
			</Tooltip>
		</Container>
	);
};

const UserShare = ({
	shareWithUserType,
	grant,
	folderId,
	onGoBack,
	secondaryLabel,
	closeFn
}: Omit<ShareCalendarModalProps, 'folderName'> & {
	shareWithUserType: ShareUserType;
}): JSX.Element | null => {
	const accounts = useUserAccounts();

	const [t] = useTranslation();
	const dispatch = useAppDispatch();
	const createSnackbar = useSnackbar();

	const [ContactInput, integrationAvailable] = useIntegratedComponent('contact-input');

	const [shareWithUserRole, setshareWithUserRole] = useState('r');
	const [sendNotification, setSendNotification] = useState(true);
	const [standardMessage, setStandardMessage] = useState('');
	const [contacts, setContacts] = useState<Contacts>([]);
	const [allowToSeePrvtAppt, setAllowToSeePrvtAppt] = useState(false);
	const disabled = useMemo(() => !contacts.length || some(contacts, 'error'), [contacts]);

	const shareCalendarRoleOptions = useMemo(
		() => ShareCalendarRoleOptions(grant?.[0]?.perm?.includes('p')),
		[grant]
	);

	const onContactInputChange = useCallback(
		(ev) => {
			setContacts(ev);
		},
		[setContacts]
	);

	const onShareRoleChange = useCallback(
		(shareRole) => {
			setshareWithUserRole(shareRole);
		},
		[setshareWithUserRole]
	);

	const onConfirm = useCallback((): void => {
		const granted = map(contacts, (contact) => ({
			gt: SHARE_USER_TYPE.USER,
			inh: '1',
			d: contact.email,
			perm: `${shareWithUserRole}${allowToSeePrvtAppt ? 'p' : ''}`,
			pw: ''
		}));
		folderAction({ id: folderId, op: FOLDER_OPERATIONS.GRANT, grant: granted }).then((res) => {
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
	}, [
		accounts,
		allowToSeePrvtAppt,
		closeFn,
		contacts,
		createSnackbar,
		dispatch,
		folderId,
		sendNotification,
		shareWithUserRole,
		shareWithUserType,
		standardMessage,
		t
	]);

	return (
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
						placeholder={t('share.placeholder.recipients_address', 'Recipients e-mail addresses')}
						onChange={onContactInputChange}
						background={'gray5'}
						defaultValue={contacts}
					/>
				) : (
					<ChipInput
						placeholder={t('share.placeholder.recipients_address', 'Recipients e-mail addresses')}
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
			<SharePrivateCheckbox
				allowToSeePrvtAppt={allowToSeePrvtAppt}
				setAllowToSeePrvtAppt={setAllowToSeePrvtAppt}
			/>
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
					dropdownWidth={'auto'}
					dropdownMaxWidth={'unset'}
					placement={'bottom-start'}
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
							'The standard message displays your name, the name of the shared item, permissions granted to the recipients, and sign in information.'
						)}
					</Text>
				</Row>
			</Container>
			<ModalFooter
				onConfirm={onConfirm}
				label={t('action.share_calendar', 'Share Calendar')}
				disabled={disabled}
				secondaryAction={onGoBack}
				secondaryLabel={secondaryLabel}
			/>
		</>
	);
};

const PublicShare = ({
	onGoBack,
	secondaryLabel,
	folderId,
	closeFn
}: Omit<ShareCalendarModalProps, 'folderName' | 'grant'>): JSX.Element => {
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();

	const onConfirm = useCallback((): void => {
		const grant = {
			gt: SHARE_USER_TYPE.PUBLIC,
			inh: '1',
			perm: 'r',
			pw: ''
		};
		folderAction({ id: folderId, op: FOLDER_OPERATIONS.GRANT, grant }).then((res) => {
			if (!res.Fault) {
				createSnackbar({
					key: `folder-action-success`,
					replace: true,
					type: 'success',
					hideButton: true,
					label: t('snackbar.share_folder_success', 'Calendar shared successfully'),
					autoHideTimeout: 3000
				});
			}
		});
		closeFn && closeFn();
	}, [closeFn, createSnackbar, folderId, t]);

	return (
		<ModalFooter
			onConfirm={onConfirm}
			label={t('action.share_calendar', 'Share Calendar')}
			secondaryAction={onGoBack}
			secondaryLabel={secondaryLabel}
		/>
	);
};

export const ShareCalendarModal: FC<ShareCalendarModalProps> = ({
	folderName,
	folderId,
	closeFn,
	onGoBack,
	secondaryLabel,
	grant
}): ReactElement => {
	const [t] = useTranslation();
	const shareCalendarWithOptions = useMemo(() => ShareCalendarWithOptions(), []);

	const [shareWithUserType, setShareWithUserType] = useState(SHARE_USER_TYPE.USER);

	const title = useMemo(() => `${t('label.share', 'Share')} ${folderName}`, [folderName, t]);

	const onShareWithChange = useCallback((shareWith) => {
		setShareWithUserType(shareWith);
	}, []);

	return (
		<Container
			data-testid="ShareCalendarModal"
			padding="0.5rem 0.5rem 1.5rem"
			style={{ overflowY: 'auto' }}
		>
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
						value: SHARE_USER_TYPE.USER,
						label: findLabel(shareCalendarWithOptions, SHARE_USER_TYPE.USER)
					}}
				/>
			</Container>
			{shareWithUserType === SHARE_USER_TYPE.USER ? (
				<UserShare
					shareWithUserType={shareWithUserType}
					grant={grant}
					folderId={folderId}
					onGoBack={onGoBack}
					secondaryLabel={secondaryLabel}
					closeFn={closeFn}
				/>
			) : (
				<PublicShare
					onGoBack={onGoBack}
					secondaryLabel={secondaryLabel}
					folderId={folderId}
					closeFn={closeFn}
				/>
			)}
		</Container>
	);
};
