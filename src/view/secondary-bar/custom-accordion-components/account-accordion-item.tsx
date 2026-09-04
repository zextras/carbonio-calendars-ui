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
import { ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-ui-commons';

export const AccountAccordionItem: FC<AccordionItemProps> = (props) => {
	const { id, label } = props.item;

	const item: AccordionItemType = {
		id,
		label,
		textProps: { size: 'small' }
	};

	return (
		<Container
			gap="0.25rem"
			orientation="horizontal"
			mainAlignment="flex-start"
			padding={{ vertical: 'extrasmall' }}
			minWidth={0}
			flexGrow={1}
			flexBasis="0"
		>
			<Avatar
				label={label ?? ''}
				colorLabel={ZIMBRA_STANDARD_COLORS[0].hex}
				size="medium"
				style={{ flexShrink: 0 }}
			/>
			<Tooltip label={label}>
				<AccordionItem {...props} item={item} />
			</Tooltip>
		</Container>
	);
};
