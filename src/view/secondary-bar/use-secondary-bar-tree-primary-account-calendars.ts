/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';

import { FindSharesAccordionItem } from './custom-accordion-components/find-shares-accordion-item';
import { useSecondaryBarTreeCalendars } from './use-secondary-bar-tree-calendars';

export const useSecondaryBarTreePrimaryCalendars = (rootId: string): Array<AccordionItemType> => {
	const calendarsItems = useSecondaryBarTreeCalendars(rootId);

	return useMemo<Array<AccordionItemType>>(
		() => [
			...calendarsItems,
			// Append "find shares" button item
			{
				id: 'find-shares',
				disableHover: true,
				CustomComponent: FindSharesAccordionItem
			}
		],
		[calendarsItems]
	);
};
