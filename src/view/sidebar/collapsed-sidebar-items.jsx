/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';
import { filter, map, reduce, reject } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { Row, IconButton, Padding, Tooltip } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { folderAction } from '../../store/actions/calendar-actions';
import { setSearchRange } from '../../store/actions/set-search-range';
import { selectAllCalendars, selectEnd, selectStart } from '../../store/selectors/calendars';
import { SIDEBAR_ITEMS } from '../../constants/sidebar';

const CollapsedSidebarItems = ({ item }) => {
	const { name, color, checked = undefined } = item;
	const dispatch = useDispatch();
	const calendars = useSelector(selectAllCalendars);
	const start = useSelector(selectStart);
	const end = useSelector(selectEnd);

	const recursiveToggleCheck = useCallback(() => {
		const selectedItem =
			item.id === SIDEBAR_ITEMS.ALL_CALENDAR
				? filter(
						calendars,
						(c) => c.id !== FOLDERS.TRASH && !c.owner && c.parent === FOLDERS.USER_ROOT
				  )
				: [item];
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
		const toToggle = applyToChildren(selectedItem);
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
		if (item.id === FOLDERS.TRASH) return checked ? 'Trash2' : 'Trash2Outline';
		if (item.owner) return checked ? 'SharedCalendar' : 'SharedCalendarOutline';
		return checked ? 'Calendar2' : 'CalendarOutline';
	}, [checked, item.id, item.owner]);

	return (
		<Row>
			<Tooltip label={name} placement="right">
				<Padding horizontal="small">
					<IconButton
						icon={icon}
						customColor={color?.color}
						size="large"
						onClick={recursiveToggleCheck}
					/>
				</Padding>
			</Tooltip>
		</Row>
	);
};

export const CollapsedItems = ({ items }) =>
	map(reject(items, ['id', 'shares']), (item, index) => (
		<CollapsedSidebarItems key={index} item={item} />
	));
