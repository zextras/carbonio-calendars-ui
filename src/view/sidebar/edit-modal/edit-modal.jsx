/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainEditModal } from './parts/main-edit-modal';
import { ShareCalendarModal } from '../share-calendar-modal';
import { RevokeModal } from './parts/revoke-modal';
import { EditModalContext } from '../../../commons/edit-modal-context';
import { EditPermissionModal } from './parts/edit-permission-modal';
import { ShareCalendarRoleOptions } from '../../../settings/components/utils';

export const EditModal = ({ onClose, folder, totalAppointments }) => {
	const [modal, setModal] = useState('main');
	const [t] = useTranslation();
	const [grant, setGrant] = useState();

	const roleOptions = useMemo(() => ShareCalendarRoleOptions(t), [t]);

	const onGoBack = useCallback(() => {
		setModal('main');
	}, [setModal]);

	return (
		<>
			<EditModalContext.Provider value={{ setModal, setGrant, onClose, roleOptions }}>
				{modal === 'main' && (
					<MainEditModal folder={folder} totalAppointments={totalAppointments} />
				)}

				{(modal === 'share' && (
					<ShareCalendarModal
						folder={folder}
						closeFn={onClose}
						onGoBack={onGoBack}
						secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
					/>
				)) ||
					(modal === 'revoke' && <RevokeModal folder={folder} grant={grant} onGoBack={onGoBack} />)}

				{modal === 'edit' && (
					<EditPermissionModal folder={folder} grant={grant} onGoBack={onGoBack} />
				)}
			</EditModalContext.Provider>
		</>
	);
};
