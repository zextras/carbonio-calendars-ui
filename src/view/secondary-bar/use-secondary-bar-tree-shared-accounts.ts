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
import { useSecondaryBarTreeCalendars } from './use-secondary-bar-tree-calendars';

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
	}, [account, primaryAccountRoot, sharedAccountRoots, groupsItems]);
};
