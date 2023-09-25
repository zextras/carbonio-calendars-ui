/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { t } from '@zextras/carbonio-shell-ui';

import { isTrashOrNestedInIt } from '../carbonio-ui-commons/store/zustand/folder/utils';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import { FOLDER_ACTIONS } from '../constants/sidebar';
import { getFolderRequest } from '../soap/get-folder-request';
import { folderAction } from '../store/actions/calendar-actions';
import { StoreProvider } from '../store/redux';
import { ActionsClick } from '../types/actions';
import { DeleteModal } from '../view/sidebar/delete-modal';
import { EditModal } from '../view/sidebar/edit-modal/edit-modal';
import ShareCalendarUrlModal from '../view/sidebar/edit-modal/parts/share-calendar-url-modal';
import { EmptyModal } from '../view/sidebar/empty-modal';
import { NewModal } from '../view/sidebar/new-modal';
import { ShareCalendarModal } from '../view/sidebar/share-calendar-modal';
import { SharesInfoModal } from '../view/sidebar/shares-info-modal';

export const newCalendar =
	({ createModal }: { createModal: any }): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		const closeModal = createModal(
			{
				children: (
					<StoreProvider>
						<NewModal onClose={(): void => closeModal()} />
					</StoreProvider>
				)
			},
			true
		);
	};

export const moveToRoot =
	({ createSnackbar, item }: { createSnackbar: any; item: any }): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		folderAction({ id: item.id, op: 'move', changes: { parent: FOLDERS.USER_ROOT } }).then(
			(res) => {
				if (!res.Fault) {
					createSnackbar({
						key: `calendar-moved-root`,
						replace: true,
						type: isTrashOrNestedInIt(item) ? 'success' : 'info',
						hideButton: true,
						label: isTrashOrNestedInIt(item)
							? t('message.snackbar.calendar_restored', 'Calendar restored successfully')
							: t(
									'message.snackbar.calendar_moved_to_root_folder',
									'Calendar moved to Root folder'
							  ),
						autoHideTimeout: 3000
					});
				} else {
					createSnackbar({
						key: `calendar-moved-root-error`,
						replace: true,
						type: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
			}
		);
	};

export const emptyTrash =
	({ createModal }: { createModal: any }): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		const closeModal = createModal(
			{
				children: (
					<StoreProvider>
						<EmptyModal onClose={(): void => closeModal()} />
					</StoreProvider>
				),
				onClose: () => {
					closeModal();
				}
			},
			true
		);
	};

export const editCalendar =
	({ createModal, item }: { createModal: any; item: any }): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		const closeModal = createModal(
			{
				children: (
					<StoreProvider>
						<EditModal
							folder={item}
							totalAppointments={item.n ?? 0}
							onClose={(): void => closeModal()}
						/>
					</StoreProvider>
				),
				maxHeight: '70vh',
				size: 'medium'
			},
			true
		);
	};

export const deleteCalendar =
	({ createModal, item }: { createModal: any; item: any }): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		const closeModal = createModal(
			{
				children: (
					<StoreProvider>
						<DeleteModal folder={item} onClose={(): void => closeModal()} />
					</StoreProvider>
				)
			},
			true
		);
	};

export const removeFromList =
	({ item }: { item: any }): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		folderAction({ id: item.id, op: FOLDER_ACTIONS.DELETE });
	};

export const sharesInfo =
	({ item, createModal }: { item: any; createModal: any }): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		getFolderRequest({ id: item.id }).then((res) => {
			if (!res.Fault) {
				const closeModal = createModal(
					{
						children: (
							<StoreProvider>
								<SharesInfoModal onClose={(): void => closeModal()} folder={res.link} />
							</StoreProvider>
						)
					},
					true
				);
			}
		});
	};

export const shareCalendar =
	({ item, createModal }: { item: any; createModal: any }): ((e?: ActionsClick) => void) =>
	() => {
		const closeModal = createModal(
			{
				children: (
					<StoreProvider>
						<ShareCalendarModal
							folderName={item.name}
							folderId={item.id}
							closeFn={(): void => closeModal()}
							grant={item?.acl?.grant ?? []}
						/>
					</StoreProvider>
				),
				maxHeight: '70vh',
				onClose: () => {
					closeModal();
				}
			},
			true
		);
	};

export const shareCalendarUrl =
	({ item, createModal }: { item: any; createModal: any }): ((e?: ActionsClick) => void) =>
	() => {
		const closeModal = createModal(
			{
				children: (
					<StoreProvider>
						<ShareCalendarUrlModal folderName={item.name} onClose={(): void => closeModal()} />
					</StoreProvider>
				),
				maxHeight: '70vh',
				size: 'medium'
			},
			true
		);
	};
