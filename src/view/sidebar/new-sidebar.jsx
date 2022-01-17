/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Accordion, Container, Icon, Padding, Text, Tooltip } from '@zextras/zapp-ui';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { every, filter, map, reduce, remove } from 'lodash';
import styled, { css } from 'styled-components';
import { selectAllCalendars, selectEnd, selectStart } from '../../store/selectors/calendars';
import { folderAction } from '../../store/actions/calendar-actions';
import { setSearchRange } from '../../store/actions/set-search-range';

function pseudoClasses(theme, color) {
	return css`
		transition: background 0.2s ease-out;
		&:focus {
			outline: none;
			background: ${theme.palette[color].focus};
		}
		&:hover {
			outline: none;
			background: ${theme.palette[color].hover};
		}
		&:active {
			outline: none;
			background: ${theme.palette[color].active};
		}
	`;
}

const AccordionContainerEl = styled(Container)`
	padding: ${(props) => `
		${props.level === 0 ? props.theme.sizes.padding.large : props.theme.sizes.padding.medium}
		${props.theme.sizes.padding.large}
		${props.level === 0 ? props.theme.sizes.padding.large : props.theme.sizes.padding.medium}
		calc(${props.theme.sizes.padding.large} + ${
		props.level > 1 ? props.theme.sizes.padding.medium : '0px'
	})
	`};
	${({ theme }) => pseudoClasses(theme, 'gray5')};
`;

const nest = (items, id) =>
	map(
		filter(items, (item) => item.parent === id),
		(item) => ({
			...item,
			absParent: item.absParent ?? item.parent,
			items: nest(items, item.id)
		})
	);

const Component = ({ item }) => {
	const { name, id, checked, color, icon, ...rest } = item;
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

	return (
		<Container
			orientation="vertical"
			width="fill"
			height="fit"
			background="gray5"
			onContextMenu={(e) => {
				e.preventDefault();
				console.log('contextmenu');
			}}
			// eslint-disable-next-line react/jsx-props-no-spreading
			{...rest}
		>
			<Tooltip label={name} placement="right" maxWidth="100%">
				<AccordionContainerEl
					orientation="horizontal"
					width="fill"
					height="fit"
					mainAlignment="space-between"
					tabIndex={0}
				>
					<Container
						orientation="horizontal"
						mainAlignment="flex-start"
						padding={{ right: 'small' }}
						style={{ minWidth: 0, flexBasis: 0, flexGrow: 1 }}
					>
						<Padding right="small">
							<Icon
								icon={icon}
								customColor={color?.color}
								size="large"
								onClick={recursiveToggleCheck}
							/>
						</Padding>
						<Text size="large" weight="bold" style={{ minWidth: 0, flexBasis: 0, flexGrow: 1 }}>
							{name}
						</Text>
					</Container>
				</AccordionContainerEl>
			</Tooltip>
		</Container>
	);
};

const useSidebarItems = () => {
	const calendars = useSelector(selectAllCalendars);
	const nestedCalendars = useMemo(() => nest(calendars, '1'), [calendars]);
	const [t] = useTranslation();

	const allItems = useMemo(() => {
		const trashItem = remove(nestedCalendars, (c) => c.id === '3'); // move Trash folder to the end
		return map(nestedCalendars.concat(trashItem) ?? [], (folder) => ({
			id: folder.id,
			name: folder.name,
			color: folder.color,
			icon: folder.icon,
			checked: folder.checked,
			open: true,
			CustomComponent: Component
		}));
	}, [nestedCalendars]);

	const allCalendarsItem = useMemo(() => {
		const checked = every(
			filter(nestedCalendars, (c) => c.id !== '3' && !c.isShared),
			['checked', true]
		);

		return {
			name: t('label.all_calendars', 'All calendars'),
			icon: checked ? 'Calendar2' : 'CalendarOutline',
			id: 'all',
			checked,
			onIconClick: () => null
		};
	}, [nestedCalendars, t]);
	return [allCalendarsItem, ...allItems];
};

export default function SetMainMenuItems({ expanded }) {
	const items = useSidebarItems();

	return <Accordion items={items} />;
}
