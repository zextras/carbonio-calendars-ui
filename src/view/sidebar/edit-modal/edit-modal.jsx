/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { MainEditModal } from './parts/main-edit-modal';
import { ShareCalendarModal } from '../share-calendar-modal';
import { ShareRevokeModal } from './parts/revoke-modal';
import { EditModalContext } from '../../../commons/edit-modal-context';
import { EditPermissionModal } from './parts/edit-permission-modal';
import { ShareCalendarRoleOptions } from '../../../settings/components/utils';

export const EditModal = ({ onClose, folder, totalAppointments }) => {
	const [activeGrant, setActiveGrant] = useState({});
	const [modal, setModal] = useState('main');
	const [t] = useTranslation();
	const [grant, setGrant] = useState({});

	const roleOptions = useMemo(
		() => ShareCalendarRoleOptions(grant?.[0]?.perm?.includes('p')),
		[grant]
	);

	const onGoBack = useCallback(() => {
		setModal('main');
	}, [setModal]);

	useEffect(() => {
		soapFetch('GetFolder', {
			_jsns: 'urn:zimbraMail',
			folder: { l: folder.id }
		}).then((res) => {
			if (res?.folder?.[0]?.acl?.grant) {
				setGrant(res.folder[0].acl.grant);
			}
		});
	}, [folder.id]);

	return (
		<>
			<EditModalContext.Provider value={{ setModal, onClose, roleOptions, setActiveGrant }}>
				{modal === 'main' && (
					<MainEditModal folder={folder} totalAppointments={totalAppointments} grant={grant} />
				)}

				{(modal === 'share' && (
					<ShareCalendarModal
						folderName={folder.name}
						folderId={folder.id}
						closeFn={onClose}
						onGoBack={onGoBack}
						secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
						grant={grant}
					/>
				)) ||
					(modal === 'revoke' && (
						<ShareRevokeModal
							folder={folder}
							grant={Object.keys(activeGrant).length > 0 ? activeGrant : folder?.acl?.grant[0]}
							onGoBack={onGoBack}
						/>
					))}

				{modal === 'edit' && (
					<EditPermissionModal
						folder={folder}
						grant={Object.keys(activeGrant).length > 0 ? activeGrant : folder?.acl?.grant[0]}
						onGoBack={onGoBack}
					/>
				)}
			</EditModalContext.Provider>
		</>
	);
};
