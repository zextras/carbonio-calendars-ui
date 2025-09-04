/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { AccountAccordionItem } from './custom-accordion-components/account-accordion-item';
import { useSecondaryBarTreeCalendars } from './use-secondary-bar-tree-calendars';
import { useSecondaryBarTreeGroups } from './use-secondary-bar-tree-groups';
import { SIDEBAR_ROOT_SUBSECTION } from '../../constants/sidebar';

export const useSecondaryBarTreePrimaryAccount = (): AccordionItemType => {
	const account = useUserAccount();
	const groupsItems = useSecondaryBarTreeGroups();
	const calendarsItems = useSecondaryBarTreeCalendars(FOLDERS.USER_ROOT);

	return useMemo(
		() => ({
			id: FOLDERS.USER_ROOT,
			label: account?.name,
			CustomComponent: AccountAccordionItem,
			items: [
				{ id: SIDEBAR_ROOT_SUBSECTION.CALENDARS, label: 'Calendars', items: calendarsItems },
				{ id: SIDEBAR_ROOT_SUBSECTION.GROUPS, label: 'Groups', items: groupsItems }
			]
		}),
		[account, groupsItems, calendarsItems]
	);
};
