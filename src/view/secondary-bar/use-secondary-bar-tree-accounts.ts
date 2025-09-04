/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { useRootsArray } from '@zextras/carbonio-ui-commons';

import { AccountAccordionItem } from './custom-accordion-components/account-accordion-item';
import { useSecondaryBarTreeGroups } from './use-secondary-bar-tree-groups';
import { SIDEBAR_ROOT_SUBSECTION } from '../../constants/sidebar';

export const useSecondaryBarTreeAccounts = (): Array<AccordionItemType> => {
	const account = useUserAccount();
	const accountRoots = useRootsArray();
	const primaryAccountRoot = accountRoots?.[0];
	const sharedAccountRoots = accountRoots.slice(1);

	const groupsItems = useSecondaryBarTreeGroups();

	return useMemo(() => {
		const result: Array<AccordionItemType> = [];

		// Add primary account first if exists
		if (primaryAccountRoot) {
			result.push({
				id: primaryAccountRoot.id,
				label: account?.name,
				CustomComponent: AccountAccordionItem,
				items: [
					{ id: SIDEBAR_ROOT_SUBSECTION.CALENDARS, label: 'Calendars', items: [] },
					{ id: SIDEBAR_ROOT_SUBSECTION.GROUPS, label: 'Groups', items: groupsItems }
				]
			});
		}

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
	}, [account, primaryAccountRoot, sharedAccountRoots, groupsItems]);
};
