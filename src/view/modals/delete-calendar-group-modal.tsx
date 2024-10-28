/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { ModalBody, ModalFooter, ModalHeader, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

export type DeleteCalendarGroupModalProps = {
	groupId: string;
	onClose: () => void;
};

export const DeleteCalendarGroupModal: React.FC<DeleteCalendarGroupModalProps> = ({
	groupId,
	onClose
}) => {
	const [t] = useTranslation();
	const title = t('folder.modal.deletegroup.title', 'Delete group permanently?');
	const confirmButtonLabel = t('folder.modal.deletegroup.confirm', 'Delete permanently');

	const onConfirm = useCallback(() => {
		onClose();
	}, [onClose]);

	return (
		<>
			<ModalHeader onClose={onClose} title={title} showCloseIcon />
			<ModalBody>
				<Text>
					Are you sure you want to delete this calendar group? This action cannot be undone.
				</Text>
			</ModalBody>
			<ModalFooter confirmLabel={confirmButtonLabel} onConfirm={onConfirm} />
		</>
	);
};
