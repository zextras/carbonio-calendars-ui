/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';
import { Row, IconButton, Padding, Tooltip } from '@zextras/carbonio-design-system';

const CollapsedSidebarItems = function Accordion({ item }) {
	const { id, name, color, icon, checked = undefined, check } = item;
	const updateChecked = useCallback(() => {
		check(!checked);
	}, [check, checked]);

	return (
		<Row onClick={updateChecked}>
			<Tooltip label={name} placement="right">
				<Padding horizontal="small">
					<IconButton icon={icon} customColor={color?.color} size="large" />
				</Padding>
			</Tooltip>
		</Row>
	);
};

export default CollapsedSidebarItems;
