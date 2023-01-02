/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, ModalManagerContext } from '@zextras/carbonio-design-system';
import React, { ReactElement, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { StoreProvider } from '../../../../../store/redux';
import CustomRecurrenceModal from '../views/custom-recurrence-modal';

const CustomRepeatSelectItem = ({ editorId, callbacks }): ReactElement => {
	const [t] = useTranslation();
	const createModal = useContext(ModalManagerContext);

	const onClick = useCallback(() => {
		const closeModal = createModal(
			{
				maxHeight: '90vh',
				children: (
					<StoreProvider>
						<CustomRecurrenceModal
							editorId={editorId}
							callbacks={callbacks}
							onClose={() => closeModal()}
						/>
					</StoreProvider>
				),
				onClose: () => {
					closeModal();
				}
			},
			true
		);
	}, [callbacks, createModal, editorId]);

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
