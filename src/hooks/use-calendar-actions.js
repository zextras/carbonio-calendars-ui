/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslation } from 'react-i18next';
import React, { useContext } from 'react';
import { ModalManagerContext, SnackbarManagerContext } from '@zextras/zapp-ui';
import { useDispatch } from 'react-redux';
import { FOLDERS } from '@zextras/zapp-shell';
import { FOLDER_ACTIONS, SIDEBAR_ITEMS } from '../constants/sidebar';
import { NewModal } from '../view/sidebar/new-modal';
import { folderAction } from '../store/actions/calendar-actions';
import { EmptyModal } from '../view/sidebar/empty-modal';
import { EditModal } from '../view/sidebar/edit-modal/edit-modal';
import { DeleteModal } from '../view/sidebar/delete-modal';
import { getFolder } from '../store/actions/get-folder';
import { SharesInfoModal } from '../view/sidebar/shares-info-modal';
import { ShareCalendarModal } from '../view/sidebar/share-calendar-modal';
import ShareCalendarUrlModal from '../view/sidebar/edit-modal/parts/share-calendar-url-modal';

export const useCalendarActions = (item) => {
	const [t] = useTranslation();
	const createModal = useContext(ModalManagerContext);
	const dispatch = useDispatch();
	const createSnackbar = useContext(SnackbarManagerContext);

	const actions = [
		{
			id: FOLDER_ACTIONS.NEW,
			icon: 'CalendarOutline',
			label: t('label.new_calendar', 'New calendar'),
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				const closeModal = createModal(
					{
						children: <NewModal onClose={() => closeModal()} />
					},
					true
				);
			}
		},
		{
			id: FOLDER_ACTIONS.MOVE_TO_ROOT,
			icon: 'MoveOutline',
			label: t('action.move_to_root', 'Move to root'),
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				dispatch(
					folderAction({ id: item.id, op: 'move', changes: { parent: FOLDERS.USER_ROOT } })
				).then((res) => {
					if (res.type.includes('fulfilled')) {
						createSnackbar({
							key: `calendar-moved-root`,
							replace: true,
							type: item?.parent === FOLDERS.TRASH ? 'success' : 'info',
							hideButton: true,
							label:
								item?.parent === FOLDERS.TRASH
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
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				const closeModal = createModal(
					{
						children: <EmptyModal onClose={() => closeModal()} />
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
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				const closeModal = createModal(
					{
						children: (
							<EditModal
								folder={item}
								grant={item.acl?.grant}
								totalAppointments={item.n}
								onClose={() => closeModal()}
							/>
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
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				const closeModal = createModal(
					{
						children: <DeleteModal folder={item} onClose={() => closeModal()} />
					},
					true
				);
			}
		},
		{
			id: FOLDER_ACTIONS.REMOVE_FROM_LIST,
			icon: 'CloseOutline',
			label: t('remove_from_this_list', 'Remove from this list'),
			click: (e) => {
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
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				dispatch(getFolder(item.id)).then((res) => {
					if (res.type.includes('fulfilled')) {
						const closeModal = createModal(
							{
								children: (
									<>
										<SharesInfoModal onClose={() => closeModal()} folder={res.payload.link} />
									</>
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
			click: () => {
				const closeModal = createModal(
					{
						children: (
							<>
								<ShareCalendarModal
									folder={item}
									totalAppointments={item.n}
									closeFn={() => closeModal()}
								/>
							</>
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
			click: () => {
				const closeModal = createModal(
					{
						children: (
							<>
								<ShareCalendarUrlModal folder={item} onClose={() => closeModal()} />
							</>
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
					action.id !== FOLDER_ACTIONS.NEW || action.id === FOLDER_ACTIONS.DELETE
						? { ...action, disabled: true }
						: action
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
			return item?.owner
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
							if (item?.parent === FOLDERS.USER_ROOT && action.id === FOLDER_ACTIONS.MOVE_TO_ROOT) {
								return { ...action, disabled: true };
							}
							if (item?.parent === FOLDERS.TRASH && action.id === FOLDER_ACTIONS.MOVE_TO_ROOT) {
								return { ...action, label: t('label.restore_calendar', 'Restore calendar') };
							}
							return action;
						});
	}
};
