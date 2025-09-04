/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AccordionItemType } from '@zextras/carbonio-design-system';
import { useRootsArray } from '@zextras/carbonio-ui-commons';

import { AccountAccordionItem } from './custom-accordion-components/account-accordion-item';

export const useSecondaryBarTreeAccounts = (): Array<AccordionItemType> => {
	const accountRoots = useRootsArray();
	const primaryAccountRoot = accountRoots[0];
	const sharedAccountRoots = accountRoots.slice(1);

	return [
		{
			id: primaryAccountRoot.id,
			CustomComponent: AccountAccordionItem,
			items: []
		},
		...sharedAccountRoots.map((account) => ({
			id: account.id,
			CustomComponent: AccountAccordionItem,
			items: []
		}))
	];
};
