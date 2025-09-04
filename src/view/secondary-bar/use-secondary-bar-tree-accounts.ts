/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AccordionItemType } from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { useRootsArray } from '@zextras/carbonio-ui-commons';

import { AccountAccordionItem } from './custom-accordion-components/account-accordion-item';

export const useSecondaryBarTreeAccounts = (): Array<AccordionItemType> => {
	const account = useUserAccount();
	const accountRoots = useRootsArray();
	const primaryAccountRoot = accountRoots?.[0];
	const sharedAccountRoots = accountRoots.slice(1);

	const result: Array<AccordionItemType> = [];

	// Add primary account first if exists
	if (primaryAccountRoot) {
		result.push({
			id: primaryAccountRoot.id,
			label: account?.name,
			CustomComponent: AccountAccordionItem,
			items: []
		});
	}

	// Then add shared accounts, if any
	if (sharedAccountRoots.length > 0) {
		const sharedAccountsItems = sharedAccountRoots.map((account) => ({
			id: account.id,
			label: account.name,
			CustomComponent: AccountAccordionItem,
			items: []
		}));
		result.push(...sharedAccountsItems);
	}

	return result;
};
