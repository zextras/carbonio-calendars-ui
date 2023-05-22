/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, IconButton, Padding, Row, Tooltip } from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import React, { FC, useCallback, useMemo } from 'react';
import { Folder } from '../../carbonio-ui-commons/types/folder';
import { setCalendarColor } from '../../normalizations/normalizations-utils';
import { folderAction } from '../../store/actions/calendar-actions';

export const CollapsedSidebarItems: FC<{ item: Folder }> = ({ item }) => {
	const { name, checked = undefined } = item;

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
			folderAction({
				id: foldersToToggleIds,
				changes: { checked },
				op: checked ? '!check' : 'check'
			});
		},
		[checked]
	);

	const icon = useMemo(() => {
		if (item.id === FOLDERS.TRASH) return checked ? 'Trash2' : 'Trash2Outline';
		if (item.isLink && item.owner) return checked ? 'SharedCalendar' : 'SharedCalendarOutline';
		return checked ? 'Calendar2' : 'CalendarOutline';
	}, [checked, item]);

	const iconColor = setCalendarColor({ color: item.color, rgb: item.rgb })?.color;

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
