/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo } from 'react';

import {
	AccordionItemProps,
	Container,
	Dropdown,
	Icon,
	Padding,
	Row,
	Tooltip,
	Text
} from '@zextras/carbonio-design-system';
import { hasId, useFoldersMap, Folder, getUpdateFolder } from '@zextras/carbonio-ui-commons';
import { reduce, find, every, map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { FOLDER_OPERATIONS } from '../../../constants/api';
import { CALENDARS_STANDARD_COLORS } from '../../../constants/calendar';
import { SIDEBAR_ITEMS } from '../../../constants/sidebar';
import { useCalendarGroupActions } from '../../../hooks/use-calendar-group-actions';
import { useCheckedCalendarsQuery } from '../../../hooks/use-checked-calendars-query';
import { folderAction } from '../../../store/actions/calendar-actions';
import { getMiniCal } from '../../../store/actions/get-mini-cal';
import { searchAppointments } from '../../../store/actions/search-appointments';
import { useAppDispatch } from '../../../store/redux/hooks';
import { CalendarGroup, useGroupById } from '../../../store/zustand/calendar-group-store';
import { useRangeStart, useRangeEnd } from '../../../store/zustand/hooks';

const GroupContextMenuItem = ({
	children,
	item
}: {
	children: React.JSX.Element;
	item: CalendarGroup;
}): React.JSX.Element => {
	const isAllCalendar = useMemo(() => hasId(item, SIDEBAR_ITEMS.ALL_CALENDAR), [item]);
	const { editGroup, deleteGroup } = useCalendarGroupActions(item.id);

	const items = useMemo(() => [editGroup, deleteGroup], [deleteGroup, editGroup]);
	return isAllCalendar ? (
		children
	) : (
		<Dropdown items={items} contextMenu width="100%" display="block">
			{children}
		</Dropdown>
	);
};

const RowWithIcon = (icon: string, color: string, tooltipText: string): React.JSX.Element => (
	<Padding left="small">
		<Tooltip placement="right" label={tooltipText}>
			<Row>
				<Icon icon={icon} color={color} size="medium" />
			</Row>
		</Tooltip>
	</Padding>
);

export const GroupAccordionItem: FC<AccordionItemProps> = (props) => {
	const groupId = props.item.id;

	const group = useGroupById(groupId);

	const dispatch = useAppDispatch();
	const start = useRangeStart();
	const end = useRangeEnd();
	const query = useCheckedCalendarsQuery();
	const calendars = useFoldersMap();
	const [t] = useTranslation();

	const calendarsInGroup = useMemo(() => {
		if (!group) {
			return [];
		}

		return reduce(
			group.calendarId,
			(acc, calendarId) => {
				const calendarToAdd = find(calendars, (cal) => cal.id === calendarId);
				if (calendarToAdd) {
					return [...acc, calendarToAdd];
				}
				return acc;
			},
			[] as Array<Folder>
		);
	}, [calendars, group]);

	const isGroupEmpty = useMemo(() => (group ? !group.calendarId?.length : false), [group]);

	const checked = isGroupEmpty ? false : every(calendarsInGroup, (cal) => cal.checked);

	const onClick = useCallback((): void => {
		if (!group || isGroupEmpty) {
			return;
		}
		const op = checked ? FOLDER_OPERATIONS.UNCHECK : FOLDER_OPERATIONS.CHECK;
		const actions = map(group.calendarId, (id) => ({
			id,
			op
		}));

		folderAction(actions).then((res) => {
			if (op === FOLDER_OPERATIONS.CHECK && !res.Fault) {
				dispatch(searchAppointments({ spanEnd: end, spanStart: start, query }));
				dispatch(getMiniCal({ start, end })).then((response) => {
					const updateFolder = getUpdateFolder();
					// todo: remove ts ignore once getMiniCal is typed
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					if (response?.payload?.Fault) {
						// todo: remove ts ignore once getMiniCal is typed
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						forEach(response?.payload?.Fault, ({ id }) => {
							updateFolder(id, { broken: true });
						});
					}
				});
			}
		});
	}, [group, isGroupEmpty, checked, dispatch, end, start, query]);

	const emptyGroupTooltip = t('label.group_is_empty', 'This group is empty');
	const emptyGroupIcon = useMemo(
		() => RowWithIcon('AlertCircleOutline', 'warning', emptyGroupTooltip),
		[emptyGroupTooltip]
	);

	return (
		group && (
			<GroupContextMenuItem item={group}>
				<Row onClick={onClick}>
					<Container
						orientation="horizontal"
						mainAlignment="flex-start"
						padding={{ all: 'small' }}
						height="2.5rem"
						style={{ minWidth: 0, flexBasis: 0, flexGrow: 1 }}
					>
						<Padding left="small" />
						<Tooltip label={isGroupEmpty ? emptyGroupTooltip : group.name}>
							<Padding right="small">
								<Icon
									icon={checked ? 'GroupCalendar' : 'GroupCalendarOutline'}
									color={CALENDARS_STANDARD_COLORS[0].color}
									size="large"
									disabled={isGroupEmpty}
								/>
							</Padding>
						</Tooltip>
						<Tooltip label={group.name} placement="right" maxWidth="100%">
							<Container height="fill" width="fill" crossAlignment="flex-start">
								<Text>{group.name}</Text>
							</Container>
						</Tooltip>
					</Container>
					{isGroupEmpty && emptyGroupIcon}
				</Row>
			</GroupContextMenuItem>
		)
	);
};
