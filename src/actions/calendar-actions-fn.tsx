/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { CloseModalFn, CreateModalFn, CreateSnackbarFn } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { filter, isEqual, lowerCase, map, uniqWith } from 'lodash';
import moment from 'moment';

import { getRoot } from '../carbonio-ui-commons/store/zustand/folder';
import { isTrashOrNestedInIt } from '../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder } from '../carbonio-ui-commons/types/folder';
import { ResFolder } from '../carbonio-ui-commons/utils';
import { FOLDER_OPERATIONS } from '../constants/api';
import { getFolderRequest } from '../soap/get-folder-request';
import { getShareInfoRequest } from '../soap/get-share-info-request';
import { folderAction } from '../store/actions/calendar-actions';
import { StoreProvider } from '../store/redux';
import { ActionsClick } from '../types/actions';
import { NewModal } from '../view/move/new-calendar-modal';
import { DeleteModal } from '../view/sidebar/delete-modal';
import { EditModal } from '../view/sidebar/edit-modal/edit-modal';
import ShareCalendarUrlModal from '../view/sidebar/edit-modal/parts/share-calendar-url-modal';
import { EmptyModal } from '../view/sidebar/empty-modal';
import { ShareCalendarModal } from '../view/sidebar/share-calendar-modal';
import { SharesInfoModal } from '../view/sidebar/shares-info-modal';
import { SharesModal } from '../view/sidebar/shares-modal';

export const newCalendar =
	({
		createModal,
		closeModal,
		item
	}: {
		createModal: CreateModalFn;
		closeModal: CloseModalFn;
		item: { id: string };
	}): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		const modalId = 'new-calendar';
		createModal(
			{
				id: modalId,
				children: (
					<StoreProvider>
						<NewModal onClose={(): void => closeModal(modalId)} folderId={item.id} />
					</StoreProvider>
				)
			},
			true
		);
	};

export const moveToRoot =
	({
		createSnackbar,
		item
	}: {
		createSnackbar: CreateSnackbarFn;
		item: { id: string; absFolderPath?: string };
	}): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		const root = getRoot(item.id);
		folderAction({ id: item.id, op: FOLDER_OPERATIONS.MOVE, l: root?.id ?? '1' }).then(
			(res: { Fault?: string }) => {
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
	({
		createModal,
		closeModal,
		item
	}: {
		createModal: CreateModalFn;
		closeModal: CloseModalFn;
		item: { id: string };
	}): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		const modalId = 'empty-trash';
		createModal(
			{
				id: modalId,
				children: (
					<StoreProvider>
						<EmptyModal onClose={(): void => closeModal(modalId)} folderId={item.id} />
					</StoreProvider>
				),
				onClose: () => {
					closeModal(modalId);
				}
			},
			true
		);
	};

export const editCalendar =
	({
		createModal,
		closeModal,
		item
	}: {
		createModal: CreateModalFn;
		closeModal: CloseModalFn;
		item: { id: string };
	}): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		const modalId = 'edit-calendar';
		createModal(
			{
				id: modalId,
				children: (
					<StoreProvider>
						<EditModal folderId={item.id} onClose={(): void => closeModal(modalId)} />
					</StoreProvider>
				),
				maxHeight: '70vh',
				size: 'medium'
			},
			true
		);
	};

export const deleteCalendar =
	({
		createModal,
		closeModal,
		item
	}: {
		createModal: CreateModalFn;
		closeModal: CloseModalFn;
		item: Folder;
	}): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		const modalId = 'delete-calendar';
		createModal(
			{
				id: modalId,
				children: (
					<StoreProvider>
						<DeleteModal folder={item} onClose={(): void => closeModal(modalId)} />
					</StoreProvider>
				)
			},
			true
		);
	};

export const removeFromList =
	({
		item,
		createSnackbar
	}: {
		item: { id: string };
		createSnackbar: CreateSnackbarFn;
	}): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		folderAction({ id: item.id, op: FOLDER_OPERATIONS.DELETE }).then((res: { Fault?: string }) => {
			if (!res.Fault) {
				createSnackbar({
					key: `shared-calendar-removed`,
					replace: true,
					type: 'info',
					hideButton: true,
					label: t('message.snackbar.shared_calendar_removed', 'Calendar removed successfully'),
					autoHideTimeout: 3000
				});
			} else {
				createSnackbar({
					key: `shared-calendar-removed-error`,
					replace: true,
					type: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			}
		});
	};

export const sharesInfo =
	({
		item,
		createModal,
		closeModal
	}: {
		item: { id: string };
		createModal: CreateModalFn;
		closeModal: CloseModalFn;
	}): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		getFolderRequest({ id: item.id }).then((res) => {
			if (!res.Fault && res.link) {
				const modalId = 'shares-info';
				createModal(
					{
						id: modalId,
						children: (
							<StoreProvider>
								<SharesInfoModal onClose={(): void => closeModal(modalId)} folder={res.link[0]} />
							</StoreProvider>
						)
					},
					true
				);
			}
		});
	};

export const shareCalendar =
	({
		item,
		createModal,
		closeModal
	}: {
		item: Folder;
		createModal: CreateModalFn;
		closeModal: CloseModalFn;
	}): ((e?: ActionsClick) => void) =>
	() => {
		const modalId = 'share-calendar';
		createModal(
			{
				id: modalId,
				children: (
					<StoreProvider>
						<ShareCalendarModal
							folderName={item.name}
							folderId={item.id}
							closeFn={(): void => closeModal(modalId)}
							grant={item?.acl?.grant ?? []}
						/>
					</StoreProvider>
				),
				maxHeight: '70vh',
				onClose: () => {
					closeModal(modalId);
				}
			},
			true
		);
	};

export const shareCalendarUrl =
	({
		item,
		createModal,
		closeModal
	}: {
		item: { name: string };
		createModal: CreateModalFn;
		closeModal: CloseModalFn;
	}): ((e?: ActionsClick) => void) =>
	() => {
		const modalId = 'share-calendar-url';
		createModal(
			{
				id: modalId,
				children: (
					<StoreProvider>
						<ShareCalendarUrlModal
							folderName={item.name}
							onClose={(): void => closeModal(modalId)}
						/>
					</StoreProvider>
				),
				maxHeight: '70vh',
				size: 'medium'
			},
			true
		);
	};

export const findShares =
	({
		createModal,
		closeModal
	}: {
		createModal: CreateModalFn;
		closeModal: CloseModalFn;
	}): ((e?: ActionsClick) => void) =>
	() => {
		getShareInfoRequest().then((res) => {
			const resCalendars: Array<ResFolder> = uniqWith(
				filter(res.calendars, ['view', 'appointment']),
				isEqual
			);
			if (res.isFulfilled) {
				const modalId = 'find-shares';
				createModal(
					{
						id: modalId,
						children: (
							<StoreProvider>
								<SharesModal calendars={resCalendars} onClose={(): void => closeModal(modalId)} />
							</StoreProvider>
						)
					},
					true
				);
			}
		});
	};

export const exportCalendarICSFn =
	({ item }: { item: { name: string; id: string } }): ((e?: ActionsClick) => void) =>
	() => {
		const downloadICS = (name: string, uri: string): void => {
			const link = document.createElement('a');
			link.download = name;
			link.href = uri;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		};
		const dateFormat = moment().format('YYYY-MM-DD');
		downloadICS(
			`${lowerCase(item?.name)}-${dateFormat}.ics`,
			`/service/home/~/?auth=co&id=${item.id}&mime=text/plain&noAttach=1&icalAttach=none`
		);
	};

export const importCalendarICSFn = async (
	files: FileList,
	userMail: string,
	calendarName: string
): Promise<Array<{ status: number }>> =>
	Promise.all(
		map(files, (file) =>
			fetch(`/home/${userMail}/${calendarName}?fmt=ics&charset=UTF-8`, {
				headers: {
					'Content-Type': 'text/calendar',
					'Access-Control-Allow-Origin': 'same origin'
				},
				method: 'POST',
				body: file
			})
		)
	);
