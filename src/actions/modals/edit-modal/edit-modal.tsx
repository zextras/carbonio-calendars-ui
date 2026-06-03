/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo, useState, useEffect } from 'react';

import { Grant } from '@zextras/carbonio-shell-ui';
import { getFolderRequest, useFolder, getUpdateFolder, Folder } from '@zextras/carbonio-ui-commons';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { EditPermissionModal } from './parts/edit-permission-modal';
import { MainEditModal } from './parts/main-edit-modal';
import { ShareRevokeModal } from './parts/revoke-modal';
import { EditModalContext } from '../../../commons/edit-modal-context';
import { ShareCalendarModal } from '../share-calendar-modal';

type EditModalProps = {
	folderId: string;
	onClose: () => void;
};

export const getShareCalendarRoleOptions = ({
	t,
	canViewPrivateAppointment
}: {
	t: TFunction;
	canViewPrivateAppointment: boolean;
}): Array<{ label: string; value: string }> => [
	{ label: t('share.options.share_calendar_role.none', 'None'), value: '' },
	{
		label: t('share.options.share_calendar_role.viewer', 'Viewer'),
		value: canViewPrivateAppointment ? 'rp' : 'r'
	},
	{
		label: t('share.options.share_calendar_role.admin', 'Admin'),
		value: canViewPrivateAppointment ? 'rwidxap' : 'rwidxa'
	},
	{
		label: t('share.options.share_calendar_role.manager', 'Manager'),
		value: canViewPrivateAppointment ? 'rwidxp' : 'rwidx'
	}
];

export const EditModal: FC<EditModalProps> = ({ onClose, folderId }) => {
	const [activeGrant, setActiveGrant] = useState({});
	const [modal, setModal] = useState('main');
	const [t] = useTranslation();
	const folder = useFolder(folderId);
	const grant = folder?.acl?.grant;

	const roleOptions = useMemo(
		() =>
			getShareCalendarRoleOptions({
				t,
				canViewPrivateAppointment: grant?.[0]?.perm?.includes('p') ?? false
			}),
		[grant, t]
	);

	const onGoBack = useCallback(() => {
		setModal('main');
	}, [setModal]);

	useEffect(() => {
		const updateFolder = getUpdateFolder();
		getFolderRequest({ id: folderId }).then((res: [Folder]) => {
			if (res?.[0]?.acl?.grant) {
				updateFolder(folderId, { acl: { grant: res?.[0]?.acl?.grant } });
			}
		});
	}, [folderId]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent): void => {
			if (e.key === 'Escape') {
				if (modal !== 'main') {
					e.preventDefault();
					onGoBack();
				} else {
					onClose();
				}
			}
		};
		window.addEventListener('keydown', onKey, { capture: true });
		return () => window.removeEventListener('keydown', onKey, { capture: true });
	}, [modal, onClose, onGoBack]);

	return (
		<EditModalContext.Provider value={{ setModal, onClose, roleOptions, setActiveGrant }}>
			{modal === 'main' && folder && (
				<MainEditModal folder={folder} totalAppointments={folder?.n ?? 0} grant={grant ?? []} />
			)}

			{(modal === 'share' && folder && (
				<ShareCalendarModal
					folderId={folderId}
					closeFn={onClose}
					onGoBack={onGoBack}
					secondaryLabel={t('folder.modal.footer.go_back', 'Go back')}
					grant={grant}
				/>
			)) ||
				(modal === 'revoke' && folder && (
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

			{modal === 'edit' && folder && (
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
	);
};
