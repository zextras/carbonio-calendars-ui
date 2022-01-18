/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Accordion,
	AccordionItem,
	Button,
	Container,
	Divider,
	Icon,
	ModalManagerContext,
	Padding,
	Text,
	Tooltip
} from '@zextras/zapp-ui';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { every, filter, isEqual, map, reduce, remove, uniqWith } from 'lodash';
import { selectAllCalendars, selectEnd, selectStart } from '../../store/selectors/calendars';
import { folderAction } from '../../store/actions/calendar-actions';
import { setSearchRange } from '../../store/actions/set-search-range';
import { getShareInfo } from '../../store/actions/get-share-info';
import { SharesModal } from './shares-modal';

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
	const { name, checked, color } = item;
	const dispatch = useDispatch();
	const calendars = useSelector(selectAllCalendars);
	const start = useSelector(selectStart);
	const end = useSelector(selectEnd);

	const recursiveToggleCheck = useCallback(() => {
		const applyToChildren = (folderArr) =>
			reduce(
				folderArr,
				(acc, v) => {
					const value = filter(calendars, (f) => f.parent === v.id);
					if (value.length > 0) {
						return [...acc, v.id, ...applyToChildren(value)];
					}
					return [...acc, v.id];
				},
				''
			);
		const toToggle = applyToChildren([item]);
		dispatch(
			folderAction({
				id: toToggle,
				changes: { checked: !!checked },
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
	}, [calendars, checked, dispatch, end, item, start]);

	const icon = useMemo(() => {
		if (item.owner) return item.checked ? 'Share' : 'ShareOutline';
		if (item.checked) return 'Calendar2';
		return 'CalendarOutline';
	}, [item.checked, item.owner]);

	return (
		<Tooltip label={name} placement="right" maxWidth="100%">
			<AccordionItem item={item}>
				<Padding right="small">
					<Icon
						icon={icon}
						customColor={color?.color}
						size="large"
						onClick={recursiveToggleCheck}
					/>
				</Padding>
				<Text style={{ minWidth: 0, flexBasis: 0, flexGrow: 1 }}>{name}</Text>
			</AccordionItem>
		</Tooltip>
	);
};

const useSidebarItems = () => {
	const calendars = useSelector(selectAllCalendars);
	const [t] = useTranslation();

	const allItems = useMemo(() => {
		const normalized = map(calendars ?? [], (folder) => ({
			...folder,
			open: true,
			CustomComponent: Component
		}));
		return nest(normalized, '1');
	}, [calendars]);
	const trashItem = useMemo(() => remove(allItems, ['id', '3']), [allItems]);
	const sharedItems = useMemo(() => remove(allItems, 'owner'), [allItems]);

	const shares = useMemo(
		() => ({
			id: 'shares',
			label: t('shared_folders', 'Shared Calendars'),
			icon: 'Share',
			open: false,
			items: sharedItems.concat({
				label: t('find_shares', 'Find shares'),
				CustomComponent: SharesItem
			}),
			divider: true
		}),
		[sharedItems, t]
	);
	const allCalendarsItem = useMemo(() => {
		const checked = every(
			filter(calendars, (c) => c.id !== '3' && !c.isShared),
			['checked', true]
		);

		return {
			name: t('label.all_calendars', 'All calendars'),
			id: 'all',
			checked,
			onIconClick: () => null,
			CustomComponent: Component
		};
	}, [calendars, t]);
	return [allCalendarsItem, ...allItems, ...trashItem, shares];
};

export default function SetMainMenuItems({ expanded }) {
	const items = useSidebarItems();

	return <Accordion items={items} />;
}
