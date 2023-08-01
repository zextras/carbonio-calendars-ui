/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo, useState, useEffect } from 'react';

import { Grant } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { EditPermissionModal } from './parts/edit-permission-modal';
import { MainEditModal } from './parts/main-edit-modal';
import { ShareRevokeModal } from './parts/revoke-modal';
import { getFolderRequest } from '../../../carbonio-ui-commons/soap/get-folder';
import { useFolder, getUpdateFolder } from '../../../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { EditModalContext } from '../../../commons/edit-modal-context';
import { ShareCalendarRoleOptions } from '../../../settings/components/utils';
import { ShareCalendarModal } from '../share-calendar-modal';

type EditModalProps = {
	folder: Folder;
	totalAppointments: number;
	onClose: () => void;
};

export const EditModal: FC<EditModalProps> = ({ onClose, folder, totalAppointments }) => {
	const [activeGrant, setActiveGrant] = useState({});
	const [modal, setModal] = useState('main');
	const [t] = useTranslation();

	const grant = useFolder(folder.id)?.acl?.grant as Grant[];

	const roleOptions = useMemo(
		() => ShareCalendarRoleOptions(grant?.[0]?.perm?.includes('p')),
		[grant]
	);

	const onGoBack = useCallback(() => {
		setModal('main');
	}, [setModal]);

	useEffect(() => {
		const updateFolder = getUpdateFolder();
		getFolderRequest({ id: folder.id }).then((res: [Folder]) => {
			if (res?.[0]?.acl?.grant) {
				updateFolder(folder.id, { acl: { grant: res?.[0]?.acl?.grant } });
			}
		});
	}, [folder]);

	return (
		<>
			<EditModalContext.Provider value={{ setModal, onClose, roleOptions, setActiveGrant }}>
				{modal === 'main' && (
					<MainEditModal
						folder={folder}
						totalAppointments={totalAppointments}
						grant={grant ?? []}
					/>
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
							grant={
								Object.keys(activeGrant).length > 0
									? (activeGrant as Grant)
									: (folder?.acl?.grant[0] as Grant)
							}
							onGoBack={onGoBack}
						/>
					))}

				{modal === 'edit' && (
					<EditPermissionModal
						folder={folder}
						grant={
							Object.keys(activeGrant).length > 0
								? (activeGrant as Grant)
								: (folder?.acl?.grant[0] as Grant)
						}
						onGoBack={onGoBack}
					/>
				)}
			</EditModalContext.Provider>
		</>
	);
};
