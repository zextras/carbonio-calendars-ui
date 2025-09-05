/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';
import { useRootsArray } from '@zextras/carbonio-ui-commons';

import { AccountAccordionItem } from './custom-accordion-components/account-accordion-item';

export const useSecondaryBarTreeSharedAccounts = (): Array<AccordionItemType> => {
	const accountRoots = useRootsArray();
	const sharedAccountRoots = accountRoots.slice(1);

	// const calendarsItems = useSecondaryBarTreeCalendars();

	return useMemo(() => {
		const result: Array<AccordionItemType> = [];

		// Then add shared accounts, if any
		if (sharedAccountRoots.length > 0) {
			const sharedAccountsItems = sharedAccountRoots.map((sharedAccount) => ({
				id: sharedAccount.id,
				label: sharedAccount.name,
				CustomComponent: AccountAccordionItem,
				items: []
			}));
			result.push(...sharedAccountsItems);
		}

		return result;
	}, [sharedAccountRoots]);
};
