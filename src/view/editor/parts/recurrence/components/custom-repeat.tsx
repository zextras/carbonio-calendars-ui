/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';

import { Button, Container, useModal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { StoreProvider } from '../../../../../store/redux';
import { CustomRecurrenceModal } from '../views/custom-recurrence-modal';

const CustomRepeatSelectItem = ({ editorId }: { editorId: string }): ReactElement => {
	const [t] = useTranslation();
	const { createModal, closeModal } = useModal();

	const onClick = useCallback(() => {
		const modalId = 'custom-recurrence';
		createModal(
			{
				id: modalId,
				maxHeight: '90vh',
				children: (
					<StoreProvider>
						<CustomRecurrenceModal editorId={editorId} onClose={(): void => closeModal(modalId)} />
					</StoreProvider>
				),
				onClose: () => {
					closeModal(modalId);
				}
			},
			true
		);
	}, [closeModal, createModal, editorId]);

	return (
		<Container width="fill" mainAlignment="center" orientation="horizontal">
			<Button
				type="outlined"
				label={t('label.custom', 'Custom')}
				color="primary"
				width="fill"
				onClick={onClick}
			/>
		</Container>
	);
};

export default CustomRepeatSelectItem;
