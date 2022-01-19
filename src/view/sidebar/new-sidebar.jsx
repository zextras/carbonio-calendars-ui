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
	Container,
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

const useDropdownActions = (item) => {
	const [t] = useTranslation();
	const createModal = useContext(ModalManagerContext);
	const dispatch = useDispatch();
	const createSnackbar = useContext(SnackbarManagerContext);
	const calendars = useSelector(selectAllCalendars);

	return [
		{
			id: 'new',
			icon: 'CalendarOutline',
			label: t('label.new_calendar', 'New calendar'),
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				const closeModal = createModal(
					{
						children: <NewModal folders={calendars} onClose={() => closeModal()} />
					},
					true
				);
			}
		},
		{
			id: 'moveToRoot',
			icon: 'MoveOutline',
			label: t('action.move_to_root', 'Move to root'),
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				dispatch(folderAction({ id: item.id, op: 'move', changes: { parent: '1' } })).then(
					(res) => {
						if (res.type.includes('fulfilled')) {
							createSnackbar({
								key: `calendar-moved-root`,
								replace: true,
								type: calendars?.[item.id]?.parent === '3' ? 'success' : 'info',
								hideButton: true,
								label:
									calendars?.[item.id]?.parent === '3'
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
					}
				);
			}
		},
		{
			id: 'emptyTrash',
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
			disabled: item.id !== '3'
		},
		{
			id: 'edit',
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
								folder={item.id}
								folders={calendars}
								grant={calendars[item.id].acl?.grant}
								allCalendars={calendars}
								totalAppointments={item.n}
								onClose={() => closeModal()}
								t={t}
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
			id: 'delete',
			icon: 'Trash2Outline',
			label: t('action.delete_calendar', 'Delete calendar'),
			click: (e) => {
				if (e) {
					e.stopPropagation();
				}
				const closeModal = createModal(
					{
						children: (
							<DeleteModal folder={item.id} allCalendars={calendars} onClose={() => closeModal()} />
						)
					},
					true
				);
			}
		},
		{
			id: 'removeFromList',
			icon: 'CloseOutline',
			label: t('remove_from_this_list', 'Remove from this list'),
			click: (e) => {
				if (e) {
					e.stopPropagation();
					dispatch(folderAction({ id: item.id, op: 'delete' }));
				}
			}
		},
		{
			id: 'sharesInfo',
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
			id: 'share',
			icon: 'SharedCalendarOutline',
			label: t('action.share_calendar', 'Share Calendar'),
			click: (e) => {
				const closeModal = createModal(
					{
						children: (
							<>
								<ShareCalendarModal
									folder={item.id}
									folders={calendars}
									allCalendars={calendars}
									totalAppointments={item.n}
									closeFn={() => closeModal()}
									t={t}
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
			id: 'share_url',
			icon: 'Copy',
			label: t('action.calendar_access_share', 'Calendar access share'),
			disabled: !calendars?.[item.id]?.acl?.grant,
			click: (e) => {
				const closeModal = createModal(
					{
						children: (
							<>
								<ShareCalendarUrlModal
									t={t}
									folder={item.id}
									onClose={() => closeModal()}
									folders={calendars}
								/>
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
					const calendars = uniqWith(
						filter(res?.payload?.share ?? [], ['view', 'appointment']),
						isEqual
					);
					const closeModal = createModal(
						{
							children: <SharesModal calendars={calendars} onClose={() => closeModal()} />
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
			id: 'shares',
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
			id: 'all',
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
