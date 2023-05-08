/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, IconButton, Padding, Row, Tooltip } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import React, { FC, useCallback, useMemo } from 'react';
import { Folder } from '../../carbonio-ui-commons/types/folder';
import { ZIMBRA_STANDARD_COLORS } from '../../commons/zimbra-standard-colors';
import { setCalendarColor } from '../../normalizations/normalizations-utils';
import { folderAction } from '../../store/actions/calendar-actions';
import { searchAppointments } from '../../store/actions/search-appointments';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { selectEnd, selectStart } from '../../store/selectors/calendars';

export const CollapsedSidebarItems: FC<{ item: Folder }> = ({ item }) => {
	const { name, checked = undefined } = item;
	const dispatch = useAppDispatch();
	const start = useAppSelector(selectStart);
	const end = useAppSelector(selectEnd);

	const recursiveToggleCheck = useCallback(
		(folder: Folder) => {
			const foldersToToggleIds: Array<string> = [];
			const checkAllChildren = (itemToCheck: Folder): void => {
				if (itemToCheck.id !== 'all') {
					foldersToToggleIds.push(itemToCheck.id);
				}
				if (itemToCheck.children.length > 0) {
					itemToCheck.children.forEach((child) => {
						checkAllChildren(child);
					});
				}
			};

			checkAllChildren(folder);
			dispatch(
				folderAction({
					id: foldersToToggleIds,
					changes: { checked },
					op: checked ? '!check' : 'check'
				})
			)
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.then((res: { meta: { arg: { op: string } } }) => {
					if (res?.meta?.arg?.op === 'check') {
						dispatch(searchAppointments({ spanEnd: end, spanStart: start }));
					}
				});
		},
		[checked, dispatch, end, start]
	);

	const icon = useMemo(() => {
		if (item.id === FOLDERS.TRASH) return checked ? 'Trash2' : 'Trash2Outline';
		if (item.isLink && item.owner) return checked ? 'SharedCalendar' : 'SharedCalendarOutline';
		return checked ? 'Calendar2' : 'CalendarOutline';
	}, [checked, item]);

	const iconColor = item.color
		? ZIMBRA_STANDARD_COLORS[item.color].color
		: setCalendarColor(item).color;

	return (
		<Container width="fill" height="fit">
			<Row mainAlignment="flex-start" takeAvailableSpace>
				<Tooltip label={name} placement="right">
					<Padding all="extrasmall">
						<IconButton
							customSize={{ iconSize: 'large', paddingSize: 'small' }}
							icon={icon}
							iconColor={iconColor}
							size="large"
							onClick={(): void => {
								recursiveToggleCheck(item);
							}}
						/>
					</Padding>
				</Tooltip>
			</Row>
		</Container>
	);
};
