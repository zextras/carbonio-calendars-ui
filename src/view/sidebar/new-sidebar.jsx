/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Accordion,
	AccordionItem,
	Button,
	Icon,
	ModalManagerContext,
	Padding,
	Dropdown,
	Text,
	Tooltip,
	SnackbarManagerContext
} from '@zextras/zapp-ui';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { every, filter, isEqual, map, reduce, remove, uniqWith } from 'lodash';
import { FOLDERS } from '@zextras/zapp-shell';
import { selectAllCalendars, selectEnd, selectStart } from '../../store/selectors/calendars';
import { folderAction } from '../../store/actions/calendar-actions';
import { setSearchRange } from '../../store/actions/set-search-range';
import { getShareInfo } from '../../store/actions/get-share-info';
import { SharesModal } from './shares-modal';
import { CollapsedItems } from './collapsed-sidebar-items';
import { NewModal } from './new-modal';
import { EmptyModal } from './empty-modal';
import { EditModal } from './edit-modal/edit-modal';
import { DeleteModal } from './delete-modal';
import { getFolder } from '../../store/actions/get-folder';
import { SharesInfoModal } from './shares-info-modal';
import { ShareCalendarModal } from './share-calendar-modal';
import ShareCalendarUrlModal from './edit-modal/parts/share-calendar-url-modal';
import { FOLDER_ACTIONS, SIDEBAR_ITEMS } from '../../constants/sidebar';

const useDropdownActions = (item) => {
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
			click: (e) => {
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
			click: (e) => {
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

const nest = (items, id) =>
	map(
		filter(items, (item) => item.parent === id),
		(item) => ({
			...item,
			absParent: item.absParent ?? item.parent,
			items: nest(items, item.id)
		})
	);

const SharesItem = ({ item }) => {
	const createModal = useContext(ModalManagerContext);
	const dispatch = useDispatch();
	const onClick = useCallback(
		() =>
			dispatch(getShareInfo()).then((res) => {
				if (res.type.includes('fulfilled')) {
					const closeModal = createModal(
						{
							children: <SharesModal onClose={() => closeModal()} />
						},
						true
					);
				}
			}),
		[createModal, dispatch]
	);
	return (
		<AccordionItem item={item}>
			<Button type="outlined" label={item.label} color="primary" size="fill" onClick={onClick} />
		</AccordionItem>
	);
};

const Component = ({ item }) => {
	const { name, checked, color, recursiveToggleCheck } = item;

	const ddItems = useDropdownActions(item);

	const icon = useMemo(() => {
		if (item.owner) return checked ? 'SharedCalendar' : 'SharedCalendarOutline';
		if (checked) return 'Calendar2';
		return 'CalendarOutline';
	}, [checked, item.owner]);

	return (
		<Dropdown items={ddItems} contextMenu width="100%" display="block">
			<AccordionItem item={item}>
				<Padding right="small">
					<Icon
						icon={icon}
						customColor={color?.color}
						size="large"
						onClick={recursiveToggleCheck}
					/>
				</Padding>
				<Tooltip label={name} placement="right" maxWidth="100%">
					<Text style={{ minWidth: 0, flexBasis: 0, flexGrow: 1 }}>{name}</Text>
				</Tooltip>
			</AccordionItem>
		</Dropdown>
	);
};

export default function SetMainMenuItems({ expanded }) {
	const calendars = useSelector(selectAllCalendars);
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const start = useSelector(selectStart);
	const end = useSelector(selectEnd);

	const acccountItems = useMemo(
		() => filter(calendars, (c) => c.id !== FOLDERS.TRASH && !c.isShared),
		[calendars]
	);

	const recursiveToggleCheck = useCallback(
		(item, checked) => {
			const applyToChildren = (folderArr) =>
				reduce(
					folderArr,
					(acc, v) => {
						const value = filter(calendars, (f) => f.parent === v.id);
						if (value.length > 0) {
							return v.checked !== checked
								? [...acc, ...applyToChildren(value)]
								: [...acc, v.id, ...applyToChildren(value)];
						}
						return v.checked !== checked ? acc : [...acc, v.id];
					},
					''
				);
			const toToggle = applyToChildren(item);
			dispatch(
				folderAction({
					id: toToggle,
					changes: { checked },
					op: checked ? '!check' : 'check'
				})
			).then((res) => {
				if (res?.meta?.arg?.op === 'check') {
					dispatch(
						setSearchRange({
							rangeStart: start,
							rangeEnd: end
						})
					);
				}
			});
		},
		[calendars, dispatch, end, start]
	);

	const allItems = useMemo(() => {
		const normalized = map(calendars ?? [], (folder) => ({
			...folder,
			recursiveToggleCheck: () => recursiveToggleCheck([folder], folder.checked),
			CustomComponent: Component
		}));
		return nest(normalized, FOLDERS.USER_ROOT);
	}, [calendars, recursiveToggleCheck]);

	const trashItem = useMemo(() => remove(allItems, ['id', FOLDERS.TRASH]), [allItems]);
	const sharedSubItems = useMemo(() => remove(allItems, 'owner'), [allItems]);

	const sharesItem = useMemo(
		() => ({
			id: SIDEBAR_ITEMS.SHARES,
			label: t('shared_folders', 'Shared Calendars'),
			icon: 'Share',
			open: false,
			items: sharedSubItems.concat({
				label: t('find_shares', 'Find shares'),
				CustomComponent: SharesItem
			}),
			divider: true
		}),
		[sharedSubItems, t]
	);

	const allCalendarsItem = useMemo(() => {
		const checked = every(acccountItems, 'checked');
		return {
			name: t('label.all_calendars', 'All calendars'),
			id: SIDEBAR_ITEMS.ALL_CALENDAR,
			checked,
			recursiveToggleCheck: () => recursiveToggleCheck(allItems, checked),
			CustomComponent: Component
		};
	}, [acccountItems, allItems, recursiveToggleCheck, t]);

	const items = [allCalendarsItem, ...allItems, ...trashItem, sharesItem];

	return (
		<>
			{expanded ? (
				<Accordion items={items} />
			) : (
				<CollapsedItems items={items} onClick={recursiveToggleCheck} />
			)}
		</>
	);
}
