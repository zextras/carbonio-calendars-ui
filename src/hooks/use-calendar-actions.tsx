/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManagerContext, SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { FOLDERS, Folder, t } from '@zextras/carbonio-shell-ui';
import React, { SyntheticEvent, useContext } from 'react';
import { FOLDER_ACTIONS, SIDEBAR_ITEMS } from '../constants/sidebar';
import { folderAction } from '../store/actions/calendar-actions';
import { getFolder } from '../store/actions/get-folder';
import { StoreProvider } from '../store/redux';
import { DeleteModal } from '../view/sidebar/delete-modal';
import { EditModal } from '../view/sidebar/edit-modal/edit-modal';
import ShareCalendarUrlModal from '../view/sidebar/edit-modal/parts/share-calendar-url-modal';
import { EmptyModal } from '../view/sidebar/empty-modal';
import { NewModal } from '../view/sidebar/new-modal';
import { ShareCalendarModal } from '../view/sidebar/share-calendar-modal';
import { SharesInfoModal } from '../view/sidebar/shares-info-modal';
import { useAppDispatch } from './redux';

type CalendarActionsProps = {
	id: string;
	icon: string;
	label: string;
	click: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent) => void;
	disabled?: boolean;
};
export const useCalendarActions = (item: Folder): Array<CalendarActionsProps> => {
	const createModal = useContext(ModalManagerContext);
	const dispatch = useAppDispatch();
	const createSnackbar = useContext(SnackbarManagerContext);

	const actions = [
		{
			id: FOLDER_ACTIONS.NEW,
			icon: 'CalendarOutline',
			label: t('label.new_calendar', 'New calendar'),
			click: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
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
			}
		},
		{
			id: FOLDER_ACTIONS.MOVE_TO_ROOT,
			icon: 'MoveOutline',
			label: t('action.move_to_root', 'Move to root'),
			click: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
				if (e) {
					e.stopPropagation();
				}
				dispatch(folderAction({ id: item.id, op: 'move', changes: { parent: FOLDERS.USER_ROOT } }))
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					.then((res) => {
						if (res.type.includes('fulfilled')) {
							createSnackbar({
								key: `calendar-moved-root`,
								replace: true,
								type: item?.parent?.id === FOLDERS.TRASH ? 'success' : 'info',
								hideButton: true,
								label:
									item?.parent?.id === FOLDERS.TRASH
										? t('label.error_try_again', 'Something went wrong, please try again')
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
					});
			}
		},
		{
			id: FOLDER_ACTIONS.EMPTY_TRASH,
			icon: 'SlashOutline',
			label: t('action.empty_trash', 'Empty Trash'),
			click: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
				if (e) {
					e.stopPropagation();
				}
				const closeModal = createModal(
					{
						children: (
							<StoreProvider>
								<EmptyModal onClose={(): void => closeModal()} />
							</StoreProvider>
						)
					},
					true
				);
			},
			disabled: item.id !== FOLDERS.TRASH
		},
		{
			id: FOLDER_ACTIONS.EDIT,
			icon: 'Edit2Outline',
			label: t('action.edit_calendar_properties', 'Edit calendar properties'),
			click: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
				if (e) {
					e.stopPropagation();
				}
				const closeModal = createModal(
					{
						children: (
							<StoreProvider>
								<EditModal
									folder={item}
									grant={item.acl?.grant}
									totalAppointments={item.n}
									onClose={(): void => closeModal()}
								/>
							</StoreProvider>
						),
						maxHeight: '70vh',
						size: 'medium'
					},
					true
				);
			}
		},
		{
			id: FOLDER_ACTIONS.DELETE,
			icon: 'Trash2Outline',
			label: t('action.delete_calendar', 'Delete calendar'),
			click: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
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
			}
		},
		{
			id: FOLDER_ACTIONS.REMOVE_FROM_LIST,
			icon: 'CloseOutline',
			label: t('remove_from_this_list', 'Remove from this list'),
			click: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
				if (e) {
					e.stopPropagation();
					dispatch(folderAction({ id: item.id, op: FOLDER_ACTIONS.DELETE }));
				}
			}
		},
		{
			id: FOLDER_ACTIONS.SHARES_INFO,
			icon: 'InfoOutline',
			label: t('shares_info', 'Shares Info'),
			click: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
				if (e) {
					e.stopPropagation();
				}
				dispatch(getFolder(item.id))
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					.then((res) => {
						if (res.type.includes('fulfilled')) {
							const closeModal = createModal(
								{
									children: (
										<StoreProvider>
											<SharesInfoModal
												onClose={(): void => closeModal()}
												folder={res.payload.link}
											/>
										</StoreProvider>
									)
								},
								true
							);
						}
					});
			}
		},
		{
			id: FOLDER_ACTIONS.SHARE,
			icon: 'SharedCalendarOutline',
			label: t('action.share_calendar', 'Share Calendar'),
			click: (): void => {
				const closeModal = createModal(
					{
						children: (
							<StoreProvider>
								<ShareCalendarModal
									folder={item}
									closeFn={(): void => closeModal()}
									grant={item?.acl?.grant ?? []}
								/>
							</StoreProvider>
						),
						maxHeight: '70vh'
					},
					true
				);
			}
		},
		{
			id: FOLDER_ACTIONS.SHARE_URL,
			icon: 'Copy',
			label: t('action.calendar_access_share', 'Calendar access share'),
			disabled: !item?.acl?.grant,
			click: (): void => {
				const closeModal = createModal(
					{
						children: (
							<StoreProvider>
								<ShareCalendarUrlModal folder={item} onClose={(): void => closeModal()} />
							</StoreProvider>
						),
						maxHeight: '70vh',
						size: 'medium'
					},
					true
				);
			}
		}
	];
	switch (item.id) {
		case FOLDERS.CALENDAR:
			return actions
				.filter(
					(action) =>
						action.id !== FOLDER_ACTIONS.EMPTY_TRASH &&
						action.id !== FOLDER_ACTIONS.REMOVE_FROM_LIST &&
						action.id !== FOLDER_ACTIONS.SHARES_INFO
				)
				.map((action) =>
					action.id !== FOLDER_ACTIONS.NEW &&
					action.id !== FOLDER_ACTIONS.EDIT &&
					action.id !== FOLDER_ACTIONS.SHARE
						? { ...action, disabled: true }
						: action
				);
		case SIDEBAR_ITEMS.ALL_CALENDAR:
			return actions
				.filter(
					(action) =>
						action.id !== FOLDER_ACTIONS.EMPTY_TRASH &&
						action.id !== FOLDER_ACTIONS.REMOVE_FROM_LIST &&
						action.id !== FOLDER_ACTIONS.SHARES_INFO
				)
				.map((action) =>
					action.id !== FOLDER_ACTIONS.NEW ? { ...action, disabled: true } : action
				);
		// trash
		case FOLDERS.TRASH:
			return actions
				.filter(
					(action) =>
						action.id !== FOLDER_ACTIONS.REMOVE_FROM_LIST &&
						action.id !== FOLDER_ACTIONS.SHARES_INFO
				)
				.map((action) =>
					action.id === FOLDER_ACTIONS.EMPTY_TRASH ? action : { ...action, disabled: true }
				);
		// customizable folders
		default:
			return item.isLink && item?.owner
				? actions
						.filter(
							(action) =>
								action.id === FOLDER_ACTIONS.SHARES_INFO ||
								action.id === FOLDER_ACTIONS.REMOVE_FROM_LIST ||
								action.id === FOLDER_ACTIONS.EDIT
						)
						.map((action) => {
							if (action.id === FOLDER_ACTIONS.MOVE_TO_ROOT || action.id === FOLDER_ACTIONS.NEW) {
								return { ...action, disabled: true };
							}
							return action;
						})
				: actions
						.filter(
							(action) =>
								action.id !== FOLDER_ACTIONS.EMPTY_TRASH &&
								action.id !== FOLDER_ACTIONS.REMOVE_FROM_LIST &&
								action.id !== FOLDER_ACTIONS.SHARES_INFO
						)
						.map((action) => {
							if (
								item?.parent?.id === FOLDERS.USER_ROOT &&
								action.id === FOLDER_ACTIONS.MOVE_TO_ROOT
							) {
								return { ...action, disabled: true };
							}
							if (item?.parent?.id === FOLDERS.TRASH && action.id === FOLDER_ACTIONS.MOVE_TO_ROOT) {
								return { ...action, label: t('label.restore_calendar', 'Restore calendar') };
							}
							return action;
						});
	}
};
