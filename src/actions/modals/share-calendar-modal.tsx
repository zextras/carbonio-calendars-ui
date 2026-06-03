/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
	Checkbox,
	Container,
	Divider,
	Icon,
	Input,
	Padding,
	ModalHeader,
	Row,
	Select,
	SingleSelectionOnChange,
	Text,
	Tooltip,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useUserAccounts } from '@zextras/carbonio-shell-ui';
import {
	ContactInputItem,
	Grant,
	ModalFooter,
	useContactInput
} from '@zextras/carbonio-ui-commons';
import { filter, find, map, some } from 'lodash';
import { useTranslation } from 'react-i18next';

import { SHARE_USER_TYPE } from '../../constants';
import { FOLDER_OPERATIONS } from '../../constants/api';
import { findLabel, ShareCalendarRoleOptions } from '../../settings/components/utils';
import { folderAction } from '../../store/actions/calendar-actions';
import { sendShareCalendarNotification } from '../../store/actions/send-share-calendar-notification';
import { useAppDispatch } from '../../store/redux/hooks';
import { ShareCalendarModalProps } from '../../types/share-calendar';
import { FolderAction } from '../../types/soap/soap-actions';

type SharePrivateCheckboxProps = {
	allowToSeePrvtAppt: boolean;
	setAllowToSeePrvtAppt: React.Dispatch<React.SetStateAction<boolean>>;
};

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

export const ShareCalendarModal: FC<ShareCalendarModalProps> = ({
	folderId,
	closeFn,
	onGoBack,
	secondaryLabel,
	grant
}): ReactElement => {
	const [t] = useTranslation();
	const title = t('label.add_internal_share', 'Add internal share');
	const internalShareLabel = t('share.label.internal_sharing', 'Internal sharing');
	const recipientsAddressDescriptionLabel = t(
		'share.description.recipients_address',
		'Enter internal addresses only. External recipients won’t be able to access the calendar.'
	);

	const accounts = useUserAccounts();

	const dispatch = useAppDispatch();
	const createSnackbar = useSnackbar();

	const ContactInput = useContactInput();
	const recipientsInputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		recipientsInputRef.current?.focus();
	}, []);

	const [shareWithUserRole, setShareWithUserRole] = useState<string | null>('r');
	const [sendNotification, setSendNotification] = useState(true);
	const [standardMessage, setStandardMessage] = useState('');
	const [contacts, setContacts] = useState<ContactInputItem[]>([]);

	const [allowToSeePrvtAppt, setAllowToSeePrvtAppt] = useState(false);

	const shareCalendarRoleOptions = useMemo(
		() => ShareCalendarRoleOptions(grant?.[0]?.perm?.includes('p')),
		[grant]
	);

	const duplicateGrantActionWarning = useMemo(
		() =>
			({
				id: 'isInGrant',
				label: t('label.duplicate_share', "You've already shared this calendar with this user"),
				color: 'error',
				type: 'icon',
				icon: 'AlertTriangle'
			}) as const,
		[t]
	);

	const contactInputHasError = useMemo(() => {
		if (grant) {
			const duplicateUsers = filter(
				grant,
				(g) => !!find(contacts, (contact) => (g.d ?? g.zid) === contact.value.email)
			);
			return some(duplicateUsers, (user) => user.perm === shareWithUserRole);
		}
		return false;
	}, [contacts, grant, shareWithUserRole]);

	const addWarningActionToChip = useCallback(
		(attendeeChip: ContactInputItem): ContactInputItem => ({
			...attendeeChip,
			actions: [duplicateGrantActionWarning, ...(attendeeChip.actions ?? [])]
		}),
		[duplicateGrantActionWarning]
	);

	const removeWarningActionFromChip = useCallback(
		(attendeeChip: ContactInputItem): ContactInputItem => ({
			...attendeeChip,
			actions: filter(
				attendeeChip.actions ?? [],
				(action) => action.id !== duplicateGrantActionWarning.id
			)
		}),
		[duplicateGrantActionWarning]
	);

	const onContactInputChange = useCallback((ev: Array<ContactInputItem>) => {
		setContacts(ev);
	}, []);

	const onShareRoleChange = useCallback<SingleSelectionOnChange<string | null>>((shareRole) => {
		setShareWithUserRole(shareRole);
	}, []);

	const onConfirm = useCallback((): void => {
		const grantUsersAction: FolderAction[] = map(contacts, (contactInputItem) => ({
			id: folderId,
			op: FOLDER_OPERATIONS.GRANT,
			grant: [
				{
					gt: SHARE_USER_TYPE.USER,
					inh: '1',
					d: contactInputItem.value.email,
					perm: `${shareWithUserRole}${allowToSeePrvtAppt ? 'p' : ''}`,
					pw: ''
				}
			]
		}));

		const folderActionToSend = grantUsersAction.length > 1 ? grantUsersAction : grantUsersAction[0];

		folderAction(folderActionToSend).then((res) => {
			if (!res.Fault) {
				createSnackbar({
					key: `folder-action-success`,
					replace: true,
					severity: 'success',
					hideButton: true,
					label: t('snackbar.share_folder_success', 'Calendar shared successfully'),
					autoHideTimeout: 3000
				});
				sendNotification &&
					dispatch(
						sendShareCalendarNotification({
							standardMessage,
							contacts: contacts.map((contact) => ({
								email: contact.value.email
							})),
							folder: folderId,
							accounts
						})
					).then((res2) => {
						if (!res2.type.includes('fulfilled')) {
							createSnackbar({
								key: `folder-action-failed`,
								replace: true,
								severity: 'error',
								hideButton: true,
								label: t('label.error_try_again', 'Something went wrong, please try again'),
								autoHideTimeout: 3000
							});
						}
					});
			} else {
				createSnackbar({
					key: `folder-action-failed`,
					replace: true,
					severity: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
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
		standardMessage,
		t
	]);

	const disabled = useMemo(
		() => !contacts.length || some(contacts, 'error') || contactInputHasError,
		[contactInputHasError, contacts]
	);

	const confirmTooltip = useMemo(() => {
		if (disabled) {
			if (contactInputHasError) {
				return t(
					'label.duplicate_shares',
					"You've already shared this calendar with one or more users"
				);
			}
			return t('label.no_changes', 'You haven’t made any changes yet');
		}
		return undefined;
	}, [contactInputHasError, disabled, t]);

	useEffect(() => {
		const changesToAdd: ContactInputItem[] = [];
		const duplicatedContacts = filter(
			contacts,
			(contact) => !!find(grant, (g) => contact.value.email === (g.d ?? g.zid))
		);
		if (duplicatedContacts.length) {
			const duplicatedContactsWithSameRole = filter(
				contacts,
				(contact) =>
					!!find(
						grant,
						(g) => contact.value.email === (g.d ?? g.zid) && g.perm === shareWithUserRole
					)
			);
			if (duplicatedContactsWithSameRole.length) {
				const duplicatesWithoutWarningAction = filter(
					duplicatedContactsWithSameRole,
					(user) => !find(user.actions, (action) => action.id === duplicateGrantActionWarning.id)
				);
				if (duplicatesWithoutWarningAction.length) {
					changesToAdd.push(...duplicatesWithoutWarningAction.map(addWarningActionToChip));
				}
			}
			const duplicatedContactsWithDifferentRole = filter(
				contacts,
				(contact) =>
					!!find(
						grant,
						(g) => contact.value.email === (g.d ?? g.zid) && g.perm !== shareWithUserRole
					)
			);
			if (duplicatedContactsWithDifferentRole.length) {
				const duplicatesWithWarningAction = filter(
					duplicatedContactsWithDifferentRole,
					(user) => !!find(user.actions, (action) => action.id === duplicateGrantActionWarning.id)
				);
				if (duplicatesWithWarningAction.length) {
					changesToAdd.push(...duplicatesWithWarningAction.map(removeWarningActionFromChip));
				}
			}
		}
		if (changesToAdd.length) {
			const newContacts = map(contacts, (contact) => {
				const newContactToUpdate = find(
					changesToAdd,
					(contactToAdd) => contactToAdd.value.id === contact.value.id
				);
				if (newContactToUpdate) {
					return newContactToUpdate;
				}
				return contact;
			});
			setContacts(newContacts);
		}
	}, [
		addWarningActionToChip,
		contacts,
		duplicateGrantActionWarning.id,
		grant,
		removeWarningActionFromChip,
		shareWithUserRole
	]);

	return (
		<Container
			data-testid="ShareCalendarModal"
			padding="0.5rem 0.5rem 1.5rem"
			style={{ overflowY: 'auto' }}
		>
			<ModalHeader onClose={closeFn} title={title} showCloseIcon />
			<Divider />
			<Container crossAlignment="flex-start" padding={{ top: 'large' }}>
				<Text size="medium" weight="bold" color="gray0">
					{internalShareLabel}
				</Text>
			</Container>
			<Container
				padding={{ top: 'large', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<ContactInput
					placeholder={`${t('share.placeholder.recipients_address', 'Recipients e-mail addresses')}*`}
					onChange={onContactInputChange}
					background={'gray5'}
					defaultValue={contacts}
					description={
						contactInputHasError
							? t(
									'label.duplicate_share_info',
									"You've already shared this calendar with one or more users. Try changing role or typing another address."
								)
							: undefined
					}
					hasError={contactInputHasError}
					inputRef={recipientsInputRef}
				/>
				<Padding top="extrasmall" />
				<Text size="extrasmall" color="secondary">
					{recipientsAddressDescriptionLabel}
				</Text>
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
						label: findLabel(shareCalendarRoleOptions, 'r') ?? ''
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
				label={t('label.add_and_close', 'Add and close')}
				disabled={disabled}
				secondaryAction={onGoBack}
				secondaryLabel={secondaryLabel}
				tooltip={confirmTooltip}
			/>
		</Container>
	);
};
