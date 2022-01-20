/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion } from '@zextras/carbonio-design-system';
import { useDispatch, useSelector } from 'react-redux';
import { map, filter, reduce, remove, every, reject, head } from 'lodash';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { selectAllCalendars, selectEnd, selectStart } from '../../store/selectors/calendars';
import { folderAction } from '../../store/actions/calendar-actions';
import { setSearchRange } from '../../store/actions/set-search-range';
import { CollapsedItems } from './collapsed-sidebar-items';
import { SIDEBAR_ITEMS } from '../../constants/sidebar';
import { FoldersComponent, SharesComponent } from './sidebar-components';

const nest = (items, id) =>
	map(
		filter(items, (item) => item.parent === id),
		(item) => ({
			...item,
			absParent: item.absParent ?? item.parent,
			items: nest(items, item.id)
		})
	);

export default function SetMainMenuItems({ expanded }) {
	const calendars = useSelector(selectAllCalendars);
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const start = useSelector(selectStart);
	const end = useSelector(selectEnd);

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
			CustomComponent: FoldersComponent
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
				CustomComponent: SharesComponent
			}),
			divider: true
		}),
		[sharedSubItems, t]
	);

	const allCalendarsItem = useMemo(() => {
		// Every controllable folders by All Calendars
		const subItems = reject(
			calendars,
			(c) => c?.absFolderPath?.includes(head(trashItem)?.label) || c.isShared
		);
		const checked = every(subItems, 'checked');
		return {
			name: t('label.all_calendars', 'All calendars'),
			id: SIDEBAR_ITEMS.ALL_CALENDAR,
			checked,
			recursiveToggleCheck: () => recursiveToggleCheck(allItems, checked),
			CustomComponent: FoldersComponent
		};
	}, [allItems, calendars, recursiveToggleCheck, t, trashItem]);

	const items = [allCalendarsItem, ...allItems, ...trashItem, sharesItem];

	return expanded ? (
		<Accordion items={items} />
	) : (
		<CollapsedItems items={items} onClick={recursiveToggleCheck} />
	);
}
