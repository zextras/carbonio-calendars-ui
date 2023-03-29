/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, Container, ModalManagerContext } from '@zextras/carbonio-design-system';
import React, { ReactElement, useCallback, useContext } from 'react';
import { t } from '@zextras/carbonio-shell-ui';
import { StoreProvider } from '../../../../../store/redux';
import { EditorCallbacks } from '../../../../../types/editor';
import CustomRecurrenceModal from '../views/custom-recurrence-modal';

const CustomRepeatSelectItem = ({
	editorId,
	callbacks
}: {
	editorId: string;
	callbacks: EditorCallbacks;
}): ReactElement => {
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
							onClose={(): void => closeModal()}
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
