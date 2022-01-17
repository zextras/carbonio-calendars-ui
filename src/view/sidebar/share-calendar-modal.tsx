/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable import/extensions */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import React, { FC, ReactElement, useCallback, useContext, useMemo, useState } from 'react';
import {
	Container,
	Input,
	Select,
	Text,
	Checkbox,
	Row,
	ChipInput,
	SnackbarManagerContext,
	ModalManagerContext
} from '@zextras/carbonio-design-system';
import { useIntegratedComponent, useUserAccounts } from '@zextras/carbonio-shell-ui';
import { filter, map } from 'lodash';
import { useDispatch } from 'react-redux';
import {
	ShareCalendarWithOptions,
	findLabel,
	ShareCalendarRoleOptions
	// @ts-ignore
} from '../../settings/components/utils';
import { shareCalendar } from '../../store/actions/share-calendar';
import { sendShareCalendarNotification } from '../../store/actions/send-share-calendar-notification';
import ModalFooter from '../../commons/modal-footer';
// @ts-ignore
import { ModalHeader } from '../../commons/modal-header';
import { ShareCalendarModalProps } from '../../types/share-calendar';
import ShareCalendarUrlModal from './edit-modal/parts/share-calendar-url-modal';

export const ShareCalendarModal: FC<ShareCalendarModalProps> = ({
	folder,
	allCalendars,
	closeFn,
	onGoBack,
	secondaryLabel,
	t
}): ReactElement => {
	const dispatch = useDispatch();

	const createSnackbar = useContext(SnackbarManagerContext);

	const [ContactInput, integrationAvailable] = useIntegratedComponent('contact-input');
	const shareCalendarWithOptions = useMemo(() => ShareCalendarWithOptions(t), [t]);
	const shareCalendarRoleOptions = useMemo(() => ShareCalendarRoleOptions(t), [t]);

	const [sendNotification, setSendNotification] = useState(true);
	const [standardMessage, setStandardMessage] = useState('');
	const [contacts, setContacts] = useState([{ email: 'abhishek.kumar@zextras.com' }]);
	const [shareWithUserType, setshareWithUserType] = useState('usr');
	const [shareWithUserRole, setshareWithUserRole] = useState('r');
	const [allowToSeePrvtAppt, setAllowToSeePrvtAppt] = useState(false);
	const createModal = useContext(ModalManagerContext);
	const accounts = useUserAccounts();

	const currentCalendar = useMemo(
		() => filter(allCalendars, { id: folder }),
		[allCalendars, folder]
	);

	const title = useMemo(
		() => `${t('label.share', 'Share')} ${currentCalendar[0]?.name}`,
		[t, currentCalendar]
	);

	const onShareWithChange = useCallback((shareWith) => {
		setshareWithUserType(shareWith);
	}, []);

	const onShareRoleChange = useCallback((shareRole) => {
		setshareWithUserRole(shareRole);
	}, []);

	const openShareUrlModal = (): void => {
		// @ts-ignore
		const closeModal = createModal(
			{
				children: (
					<>
						<ShareCalendarUrlModal
							folder={folder}
							onClose={(): void => closeModal()}
							folders={allCalendars}
							t={t}
							isFromEditModal
						/>
					</>
				),
				maxHeight: '70vh',
				size: 'medium'
			},
			true
		);
		closeFn();
	};
	const onConfirm = (): void => {
		dispatch(
			// @ts-ignore
			shareCalendar({
				sendNotification,
				standardMessage,
				contacts,
				shareWithUserType,
				shareWithUserRole,
				folder,
				accounts,
				allowToSeePrvtAppt
			}) // @ts-ignore
		).then((res: any) => {
			if (res.type.includes('fulfilled')) {
				// @ts-ignore
				createSnackbar({
					key: `folder-action-success`,
					replace: true,
					type: 'info',
					hideButton: true,
					label: t('snackbar.share_folder_success', 'This Calendar has been shared'),
					autoHideTimeout: 3000
				});
				// @ts-ignore
				sendNotification &&
					dispatch(
						// @ts-ignore
						sendShareCalendarNotification({
							sendNotification,
							standardMessage,
							contacts,
							shareWithUserType,
							shareWithUserRole,
							folder,
							accounts
						}) // @ts-ignore
					).then((res2: any) => {
						if (!res2.type.includes('fulfilled')) {
							// @ts-ignore
							createSnackbar({
								key: `folder-action-success`,
								replace: true,
								type: 'error',
								hideButton: true,
								label: t('snackbar.invite.error', 'Error'),
								autoHideTimeout: 3000
							});
						}
					});
			}
		});
		openShareUrlModal();
	};

	const onChange = useCallback((ev) => {
		setContacts(ev);
	}, []);

	return (
		<Container padding="8px 8px 24px">
			<ModalHeader onClose={closeFn} title={title} />
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<Select
					items={shareCalendarWithOptions}
					background="gray5"
					label="Share with"
					disablePortal
					onChange={onShareWithChange}
					defaultSelection={{
						value: 'usr',
						label: findLabel(shareCalendarWithOptions, 'usr')
					}}
				/>
			</Container>
			<Container
				padding={{ top: 'small', bottom: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				{integrationAvailable ? (
					<ContactInput
						// @ts-ignore
						placeholder={t('share.placeholder.recipients_address', 'Recipients e-mail addresses')}
						onChange={onChange}
						background="gray5"
						defaultValue={contacts}
					/>
				) : (
					<ChipInput
						placeholder={t('share.placeholder.recipients_address', 'Recipients e-mail addresses')}
						background="gray4"
						disablePortal
						onChange={(ev: any): any => {
							// @ts-ignore
							setContacts(map(ev, (contact) => ({ email: contact.address })));
						}}
						valueKey="address"
						getChipLabel={(participant: any): string =>
							participant.fullName ?? participant.name ?? participant.address
						}
					/>
				)}
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
					background="gray5"
					label="Role"
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
					onChange={(ev: any): void => {
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
							'The standard message displays your name, the name of the shared item, pemissions granted to the recipients, and sign in information, if necessary.'
						)}
					</Text>
				</Row>
			</Container>
			<ModalFooter
				onConfirm={onConfirm}
				label={t('action.share_calendar', 'Share Calendar')}
				disabled={contacts.length < 1}
				secondaryAction={onGoBack}
				secondaryLabel={secondaryLabel}
			/>
		</Container>
	);
};
