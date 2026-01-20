/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useMemo } from 'react';

import { Button, Container, Padding, Row, Tooltip } from '@zextras/carbonio-design-system';
import { Folder } from '@zextras/carbonio-ui-commons';

import { getFolderIcon, recursiveToggleCheck } from '../../commons/utilities';
import { useCheckedCalendarsQuery } from '../../hooks/use-checked-calendars-query';
import { setCalendarColor } from '../../normalizations/normalizations-utils';
import { useAppDispatch } from '../../store/redux/hooks';
import { useRangeEnd, useRangeStart } from '../../store/zustand/hooks';

export const CollapsedSidebarItem: FC<{ item: Folder }> = ({ item }) => {
	const { name, checked = false } = item;
	const dispatch = useAppDispatch();
	const start = useRangeStart();
	const end = useRangeEnd();
	const query = useCheckedCalendarsQuery();

	const icon = useMemo(() => getFolderIcon({ checked, item }), [checked, item]);

	const iconColor = setCalendarColor({ color: item.color, rgb: item.rgb })?.color;

	const onIconClick = useCallback(() => {
		recursiveToggleCheck({ folder: item, checked, dispatch, start, end, query });
	}, [checked, dispatch, end, item, query, start]);

	return (
		<Container width="fill" height="fit">
			<Row mainAlignment="flex-start" takeAvailableSpace>
				<Tooltip label={name} placement="right">
					<Padding all="extrasmall">
						<Button
							icon={icon}
							color={iconColor}
							size="large"
							onClick={onIconClick}
							style={{ padding: 'small' }}
							type={'ghost'}
						/>
					</Padding>
				</Tooltip>
			</Row>
		</Container>
	);
};
