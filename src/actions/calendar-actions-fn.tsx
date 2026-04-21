/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { CloseModalFn, CreateModalFn, CreateSnackbarFn } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import { getRoot, isTrashOrNestedInIt, Folder, ResFolder } from '@zextras/carbonio-ui-commons';
import { filter, isEqual, lowerCase, map, uniqWith } from 'lodash';
import moment from 'moment';

import { AddExternalCalendarModal } from './modals/add-external-calendar-modal';
import { CreateGroupModal } from './modals/create-group-modal';
import { DeleteCaldavCalendarModal } from './modals/delete-caldav-calendar-modal';
import { DeleteModal } from './modals/delete-modal';
import { EditCaldavCalendarModal } from './modals/edit-caldav-calendar-modal';
import { EditCaldavChildCalendarModal } from './modals/edit-caldav-child-calendar-modal';
import { EditModal } from './modals/edit-modal/edit-modal';
import { EmptyModal } from './modals/empty-modal';
import { ShareCalendarModal } from './modals/share-calendar-modal';
import { SharesInfoModal } from './modals/shares-info-modal';
import { SharesModal } from './modals/shares-modal';
import { EditExternalCalendarModal } from 'actions/modals/edit-external-calendar-modal';
import { isExternalSyncFolder, isCaldavChild } from 'commons/utilities';
import { FOLDER_OPERATIONS } from 'constants/api';
import { getFolderRequest } from 'soap/get-folder-request';
import { getImportStatusRequest } from 'soap/get-import-status-request';
import { getShareInfoRequest } from 'soap/get-share-info-request';
import { importDataRequest } from 'soap/import-data-request';
import { folderAction } from 'store/actions/calendar-actions';
import { deleteCalendarAction } from 'store/actions/delete-calendar-action';
import { StoreProvider } from 'store/redux';
import { ActionsClick } from 'types/actions';
import { NewModal } from 'view/move/new-calendar-modal';

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
				),
				onClose: () => {
					closeModal(modalId);
				}
			},
			true
		);
	};

export const createGroup =
	({
		createModal,
		closeModal
	}: {
		createModal: CreateModalFn;
		closeModal: CloseModalFn;
	}): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		const modalId = 'create-group';
		createModal(
			{
				id: modalId,
				maxHeight: '90vh',
				children: (
					<StoreProvider>
						<CreateGroupModal onClose={(): void => closeModal(modalId)} />
					</StoreProvider>
				),
				onClose: () => {
					closeModal(modalId);
				}
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
				if (res.Fault) {
					createSnackbar({
						key: `calendar-moved-root-error`,
						replace: true,
						severity: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				} else {
					createSnackbar({
						key: `calendar-moved-root`,
						replace: true,
						severity: isTrashOrNestedInIt(item) ? 'success' : 'info',
						hideButton: true,
						label: isTrashOrNestedInIt(item)
							? t('message.snackbar.calendar_restored', 'Calendar restored successfully')
							: t(
									'message.snackbar.calendar_moved_to_root_folder',
									'Calendar moved to Root folder'
								),
						autoHideTimeout: 3000
					});
				}
			}
		);
	};

export const emptyTrash =
	({
		createModal,
		closeModal
	}: {
		createModal: CreateModalFn;
		closeModal: CloseModalFn;
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
						<EmptyModal onClose={(): void => closeModal(modalId)} />
					</StoreProvider>
				),
				onClose: () => {
					closeModal(modalId);
				}
			},
			true
		);
	};

export const addIcsFromUrl =
	({
		createModal,
		closeModal
	}: {
		createModal: CreateModalFn;
		closeModal: CloseModalFn;
	}): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}

		const modalId = 'add-external-calendar';
		createModal(
			{
				id: modalId,
				children: (
					<StoreProvider>
						<AddExternalCalendarModal onClose={(): void => closeModal(modalId)} />
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
		item: { id: string; f?: string; url?: string };
	}): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}
		const isExternal = isExternalSyncFolder(item);
		const isCaldavChildFolder = isCaldavChild(item as any);
		const modalId = 'edit-calendar';

		let modalContent: React.JSX.Element;
		if (isCaldavChildFolder) {
			modalContent = (
				<EditCaldavChildCalendarModal
					folderId={item.id}
					onClose={(): void => closeModal(modalId)}
				/>
			);
		} else if (isExternal) {
			modalContent = (
				<EditExternalCalendarModal folderId={item.id} onClose={(): void => closeModal(modalId)} />
			);
		} else {
			modalContent = <EditModal folderId={item.id} onClose={(): void => closeModal(modalId)} />;
		}

		createModal(
			{
				id: modalId,
				children: <StoreProvider>{modalContent}</StoreProvider>,
				maxHeight: '90vh',
				size: 'medium',
				onClose: () => {
					closeModal(modalId);
				}
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
				),
				onClose: () => {
					closeModal(modalId);
				}
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
			if (res.Fault) {
				createSnackbar({
					key: `shared-calendar-removed-error`,
					replace: true,
					severity: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			} else {
				createSnackbar({
					key: `shared-calendar-removed`,
					replace: true,
					severity: 'info',
					hideButton: true,
					label: t('message.snackbar.shared_calendar_removed', 'Calendar removed successfully'),
					autoHideTimeout: 3000
				});
			}
		});
	};

export const syncExternalCalendar =
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
		createSnackbar({
			key: `external-calendar-sync`,
			replace: true,
			severity: 'info',
			hideButton: true,
			label: t('message.snackbar.external_calendar_syncing', 'Calendar sync has started'),
			autoHideTimeout: 6000
		});
		folderAction({ id: item.id, op: FOLDER_OPERATIONS.SYNC }).then((res: { Fault?: string }) => {
			if (res.Fault) {
				createSnackbar({
					key: `external-calendar-sync-error`,
					replace: true,
					severity: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			} else {
				createSnackbar({
					key: `external-calendar-sync`,
					replace: true,
					severity: 'success',
					hideButton: true,
					label: t('message.snackbar.external_calendar_synced', 'Calendar synced successfully'),
					autoHideTimeout: 3000
				});
			}
		});
	};

export const syncCaldavCalendar =
	({
		item,
		createSnackbar
	}: {
		item: { id?: string; dsId?: string };
		createSnackbar: CreateSnackbarFn;
	}): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}

		if (!item.dsId) {
			createSnackbar({
				key: `caldav-calendar-sync-error`,
				replace: true,
				severity: 'error',
				hideButton: true,
				label: t('label.error_try_again', 'Something went wrong, please try again'),
				autoHideTimeout: 3000
			});
			return;
		}

		createSnackbar({
			key: `caldav-calendar-sync`,
			replace: true,
			severity: 'info',
			hideButton: true,
			label: t('message.snackbar.caldav_calendars_syncing', 'Calendars sync has started'),
			autoHideTimeout: 6000
		});

		const { dsId } = item;
		const POLL_INTERVAL_MS = 2000;
		const MAX_POLLS = 30; // up to ~60 seconds

		const pollImportStatus = (attempt: number): void => {
			getImportStatusRequest()
				.then((statusResponse) => {
					const entry = statusResponse.caldav?.find((e) => e.id === dsId);

					if (!entry || entry.isRunning) {
						// Still in progress – keep polling if within limit
						if (attempt < MAX_POLLS) {
							setTimeout(() => pollImportStatus(attempt + 1), POLL_INTERVAL_MS);
						} else {
							// Timed out – treat as success (sync continues in background)
							createSnackbar({
								key: `caldav-calendar-sync`,
								replace: true,
								severity: 'success',
								hideButton: true,
								label: t(
									'message.snackbar.caldav_calendars_synced',
									'Calendars synced successfully'
								),
								autoHideTimeout: 3000
							});
						}
						return;
					}

					if (entry.success === false) {
						createSnackbar({
							key: `caldav-calendar-sync-error`,
							replace: true,
							severity: 'error',
							hideButton: true,
							label: t('label.error_try_again', 'Something went wrong, please try again'),
							autoHideTimeout: 3000
						});
					} else {
						createSnackbar({
							key: `caldav-calendar-sync`,
							replace: true,
							severity: 'success',
							hideButton: true,
							label: t('message.snackbar.caldav_calendars_synced', 'Calendars synced successfully'),
							autoHideTimeout: 3000
						});
					}
				})
				.catch(() => {
					createSnackbar({
						key: `caldav-calendar-sync-error`,
						replace: true,
						severity: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				});
		};

		importDataRequest(dsId)
			.then(() => {
				pollImportStatus(0);
			})
			.catch(() => {
				createSnackbar({
					key: `caldav-calendar-sync-error`,
					replace: true,
					severity: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			});
	};

export const editCaldavCalendar =
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

		const modalId = 'edit-caldav-calendar';
		createModal(
			{
				id: modalId,
				children: (
					<StoreProvider>
						<EditCaldavCalendarModal folderId={item.id} onClose={(): void => closeModal(modalId)} />
					</StoreProvider>
				),
				onClose: () => {
					closeModal(modalId);
				}
			},
			true
		);
	};

export const deleteCaldavCalendar =
	({
		createModal,
		closeModal,
		item
	}: {
		createModal: CreateModalFn;
		closeModal: CloseModalFn;
		item: { id: string; name: string };
	}): ((e?: ActionsClick) => void) =>
	(e?: ActionsClick) => {
		if (e) {
			e.stopPropagation();
		}

		const modalId = 'delete-caldav-calendar';
		createModal(
			{
				id: modalId,
				children: (
					<StoreProvider>
						<DeleteCaldavCalendarModal
							folder={item}
							onConfirm={(): Promise<void> =>
								deleteCalendarAction({ id: item.id, op: FOLDER_OPERATIONS.DELETE }).then(
									() => undefined
								)
							}
							onClose={(): void => closeModal(modalId)}
						/>
					</StoreProvider>
				),
				onClose: () => {
					closeModal(modalId);
				}
			},
			true
		);
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
						),
						onClose: () => {
							closeModal(modalId);
						}
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
						),
						onClose: () => {
							closeModal(modalId);
						}
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
