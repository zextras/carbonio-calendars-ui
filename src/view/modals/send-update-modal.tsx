/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useState } from 'react';

import { Container, Padding, Radio, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';

export const SEND_UPDATE_OPTIONS = {
	ADDED_OR_REMOVED: 'added-or-removed',
	ALL: 'all',
	SAVE_WITHOUT_SENDING: 'save-without-sending'
} as const;

export type SendUpdateOption = (typeof SEND_UPDATE_OPTIONS)[keyof typeof SEND_UPDATE_OPTIONS];

type SendUpdateModalProps = {
	onClose: () => void;
	onConfirm: (option: SendUpdateOption) => void;
	showSaveWithoutSendingOption?: boolean;
};

type OptionCardProps = {
	value: SendUpdateOption;
	isSelected: boolean;
	title: string;
	description: string;
	onSelect: (value: SendUpdateOption) => void;
};

const OptionCard = ({
	value,
	isSelected,
	title,
	description,
	onSelect
}: OptionCardProps): ReactElement => (
	<Container
		padding={{ vertical: 'medium', horizontal: 'large' }}
		background={isSelected ? 'highlight' : 'gray6'}
		borderColor={isSelected ? 'primary' : 'gray2.regular'}
		width="fill"
		style={{ cursor: 'pointer', borderRadius: '0.25rem' }}
		onClick={(): void => onSelect(value)}
	>
		<Radio
			value={value}
			checked={isSelected}
			iconColor="primary"
			onClick={(): void => onSelect(value)}
			label={
				<Container width="fill" crossAlignment="start" gap="0.125rem" padding={{ left: 'small' }}>
					<Text overflow="break-word" weight="regular" textAlign="start">
						{title}
					</Text>
					<Text overflow="break-word" size="small" color="gray1.active" textAlign="start">
						{description}
					</Text>
				</Container>
			}
		/>
	</Container>
);

export const SendUpdateModal = ({
	onClose,
	onConfirm,
	showSaveWithoutSendingOption = false
}: SendUpdateModalProps): ReactElement => {
	const [t] = useTranslation();
	const [selected, setSelected] = useState<SendUpdateOption>(SEND_UPDATE_OPTIONS.ADDED_OR_REMOVED);

	const onConfirmClick = useCallback(() => {
		onConfirm(selected);
	}, [onConfirm, selected]);

	return (
		<Container padding={{ all: 'large' }} mainAlignment="center" crossAlignment="flex-start">
			<ModalHeader title={t('label.send_update', 'Send update')} onClose={onClose} />
			<Container padding={{ top: 'small', bottom: 'large' }} crossAlignment="flex-start">
				<Text overflow="break-word">
					{t(
						'message.send_update_attendees_changed',
						"You've changed the attendee list. Who should get the update?"
					)}
				</Text>
				<Padding top="small" />
				<Text overflow="break-word" size="small" color="gray1.active">
					{t(
						'message.send_update_unsure_hint',
						"If you're unsure everyone has received the invitation, choose All attendees."
					)}
				</Text>
			</Container>
			<Container crossAlignment="flex-start" padding={{ bottom: 'medium' }}>
				<OptionCard
					value={SEND_UPDATE_OPTIONS.ADDED_OR_REMOVED}
					isSelected={selected === SEND_UPDATE_OPTIONS.ADDED_OR_REMOVED}
					title={t('label.send_update_added_removed', 'Only added attendees')}
					description={t(
						'label.send_update_added_removed_description',
						"Attendees you added in this edit. Anyone added in an earlier saved edit won't be notified."
					)}
					onSelect={setSelected}
				/>
				<Padding bottom="small" />
				<OptionCard
					value={SEND_UPDATE_OPTIONS.ALL}
					isSelected={selected === SEND_UPDATE_OPTIONS.ALL}
					title={t('label.send_update_all', 'All attendees')}
					description={t(
						'label.send_update_all_description',
						'Everyone invited to this event. The safe choice if you saved earlier changes without sending.'
					)}
					onSelect={setSelected}
				/>
				{showSaveWithoutSendingOption && (
					<>
						<Padding bottom="small" />
						<OptionCard
							value={SEND_UPDATE_OPTIONS.SAVE_WITHOUT_SENDING}
							isSelected={selected === SEND_UPDATE_OPTIONS.SAVE_WITHOUT_SENDING}
							title={t('label.send_update_save_without_sending', 'Save without sending')}
							description={t(
								'label.send_update_save_without_sending_description',
								"New attendees won't get an invitation until you send an update to all attendees in the next edit."
							)}
							onSelect={setSelected}
						/>
					</>
				)}
			</Container>
			<ModalFooter
				onConfirm={onConfirmClick}
				label={t('label.confirm', 'Confirm')}
				secondaryAction={onClose}
				secondaryLabel={t('label.cancel', 'Cancel')}
				secondaryBtnType="outlined"
				secondaryColor="primary"
			/>
		</Container>
	);
};
