/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type SharedAccountAccordionProps = {
	rootId: string;
};

import React, { useMemo } from 'react';

import { Accordion, AccordionItemType } from '@zextras/carbonio-design-system';
import { useRoot } from '@zextras/carbonio-ui-commons';

import { AccountAccordionItem } from './custom-accordion-components/account-accordion-item';
import { useSecondaryBarTreeCalendars } from './use-secondary-bar-tree-calendars';

export const SharedAccountAccordion = ({
	rootId
}: SharedAccountAccordionProps): React.JSX.Element => {
	const root = useRoot(rootId);
	const calendarsItems = useSecondaryBarTreeCalendars(rootId);

	const items = useMemo<Array<AccordionItemType>>(
		() => [
			{
				id: rootId,
				label: root?.name,
				CustomComponent: AccountAccordionItem,
				items: calendarsItems
			}
		],
		[calendarsItems, root?.name, rootId]
	);

	return <Accordion items={items} />;
};
