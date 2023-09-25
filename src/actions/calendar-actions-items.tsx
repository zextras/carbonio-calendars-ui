/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { t } from '@zextras/carbonio-shell-ui';

import { CalendarActionsId, FOLDER_ACTIONS } from '../constants/sidebar';
import { StoreProvider } from '../store/redux';
import { NewModal } from '../view/sidebar/new-modal';

type CalendarActionsContext = {
	createModal: any;
};

export type CalendarActionsItems = {
	id: CalendarActionsId;
	icon: string;
	disabled: boolean;
	label: string;
	onClick: (ev: React.SyntheticEvent | KeyboardEvent) => void;
	tooltipLabel: string;
};
export const newCalendarItem = ({ createModal }: CalendarActionsContext): CalendarActionsItems => ({
	id: FOLDER_ACTIONS.NEW,
	icon: 'CalendarOutline',
	label: t('label.new_calendar', 'New calendar'),
	disabled: false,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: (e: React.SyntheticEvent | KeyboardEvent): void => {
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
});
/* {
		id: FOLDER_ACTIONS.MOVE_TO_ROOT,
		icon: 'MoveOutline',
		label: t('action.move_to_root', 'Move to root'),
		onClick: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
			if (e) {
				e.stopPropagation();
			}
			folderAction({ id: item.id, op: 'move', changes: { parent: FOLDERS.USER_ROOT } }).then(
				(res) => {
					if (!res.Fault) {
						createSnackbar({
							key: `calendar-moved-root`,
							replace: true,
							type: item?.parent === FOLDERS.TRASH ? 'success' : 'info',
							hideButton: true,
							label:
								item?.parent === FOLDERS.TRASH
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
		}
	},
	{
		id: FOLDER_ACTIONS.EMPTY_TRASH,
		icon: 'SlashOutline',
		label: t('action.empty_trash', 'Empty Trash'),
		onClick: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
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
		},
		disabled:
			item.id !== FOLDERS.TRASH ||
			(item.id === FOLDERS.TRASH &&
				!isNil(item?.n) &&
				item?.n < 1 &&
				item.id === FOLDERS.TRASH &&
				!isNil(item?.children) &&
				item.children.length < 1)
	},
	{
		id: FOLDER_ACTIONS.EDIT,
		icon: 'Edit2Outline',
		label: t('action.edit_calendar_properties', 'Edit calendar properties'),
		onClick: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
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
		}
	},
	{
		id: FOLDER_ACTIONS.DELETE,
		icon: 'Trash2Outline',
		label: t('action.delete_calendar', 'Delete calendar'),
		onClick: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
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
		onClick: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
			if (e) {
				e.stopPropagation();
				folderAction({ id: item.id, op: FOLDER_ACTIONS.DELETE });
			}
		}
	},
	{
		id: FOLDER_ACTIONS.SHARES_INFO,
		icon: 'InfoOutline',
		label: t('shares_info', 'Shares Info'),
		onClick: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent): void => {
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
		}
	},
	{
		id: FOLDER_ACTIONS.SHARE,
		icon: 'SharedCalendarOutline',
		label: t('action.share_calendar', 'Share Calendar'),
		onClick: (): void => {
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
		}
	},
	{
		id: FOLDER_ACTIONS.SHARE_URL,
		icon: 'Copy',
		label: t('action.calendar_access_share', 'Calendar access share'),
		disabled: item?.id === FOLDERS.TRASH || item?.id?.includes(':'),
		onClick: (): void => {
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
		}
	}
]; */
