/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import {
	AccordionItemProps,
	AccordionItemType,
	Tooltip,
	AccordionItem,
	Container,
	Avatar
} from '@zextras/carbonio-design-system';

export const AccountAccordionItem: FC<AccordionItemProps> = (props) => {
	const { id, label } = props.item;

	const item: AccordionItemType = {
		id,
		label
	};

	return (
		<Container
			gap="0.25rem"
			orientation="horizontal"
			mainAlignment="flex-start"
			padding={{ vertical: 'extrasmall' }}
		>
			<Avatar label={label ?? ''} colorLabel={item.iconColor} size="medium" />
			<Tooltip label={label}>
				<AccordionItem {...props} item={item} />
			</Tooltip>
		</Container>
	);
};
