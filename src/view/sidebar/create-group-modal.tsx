/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import { Container, Input, Padding, TextWithTooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';

type CreateGroupModalProps = {
	onClose: () => void;
};

export const CreateGroupModal = ({ onClose }: CreateGroupModalProps): ReactElement => {
	const [t] = useTranslation();
	const [inputValue, setInputValue] = useState('');
	const disabled = useMemo(
		() => inputValue.indexOf('/') > -1 || inputValue.length === 0,
		[inputValue]
	);

	const onCloseModal = useCallback(() => {
		setInputValue('');
		onClose();
	}, [onClose]);

	const placeholder = useMemo(() => t('label.type_group_name_here', 'Group Name'), [t]);
	const onConfirm = (): void => {
		if (inputValue) {
			// TODO: call api to create group
		}
		setInputValue('');
		onClose();
	};

	return (
		<Container
			padding={{ all: 'small' }}
			mainAlignment="center"
			crossAlignment="flex-start"
			height="fit"
		>
			<ModalHeader
				title={t('folder.modal.creategroup.title', 'Create new Calendar Group')}
				onClose={onCloseModal}
			/>
			<Input
				label={placeholder}
				backgroundColor="gray5"
				value={inputValue}
				onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
					setInputValue(e.target.value);
				}}
			/>
			<TextWithTooltip size="extrasmall">
				{t('label.newgroup.note', 'This group will appear in your personal account')}
			</TextWithTooltip>
			<Padding vertical="medium" />

			<ModalFooter
				onConfirm={onConfirm}
				label={t('folder.modal.creategroup.footer', 'Create Group')}
				disabled={disabled}
			/>
		</Container>
	);
};
