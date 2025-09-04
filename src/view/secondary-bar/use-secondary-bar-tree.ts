/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { FOLDERS, useRootsMap, useSortedTagsArray } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { TagAccordionItem } from './custom-accordion-components/tag-accordion-item';
import { TagsAggregatorAccordionItem } from './custom-accordion-components/tags-aggregator-accordion-item';
import { useSecondaryBarTreeAccounts } from './use-secondary-bar-tree-accounts';
import { useSecondaryBarTreeGroups } from './use-secondary-bar-tree-groups';
import { SIDEBAR_ROOT_SUBSECTION } from '../../constants/sidebar';

export const useSecondaryBarTree = (): Array<AccordionItemType> => {
	const [t] = useTranslation();
	const { name: primaryAccountName } = useUserAccount();

	// Obtain the accounts list
	const allAccounts = useRootsMap();

	// Obtain the calendars groups
	const calendarGroupsItems = useSecondaryBarTreeGroups();

	// Obtain the primary account root
	const primaryAccountRoot = useMemo(() => allAccounts[FOLDERS.USER_ROOT], [allAccounts]);

	// Obtain the shared accounts roots
	const sharedAccountsRoots = useMemo(
		() => Object.values(allAccounts).filter((account) => account.id !== FOLDERS.USER_ROOT),
		[allAccounts]
	);

	// Obtain the calendars list for each account

	// Obtain the calendars groups for the primary account

	// Obtain the tags list for the primary account
	const tags = useSortedTagsArray();

	// Generate tags accordion items for the primary account
	const tagsItems = useMemo(
		() =>
			tags.map(
				(tag) =>
					({
						id: tag.id,
						CustomComponent: TagAccordionItem
					}) satisfies AccordionItemType
			),
		[tags]
	);

	// Generate "Calendars" aggregator accordion item for the primary account
	const calendarsAggregatorItem: AccordionItemType = useMemo(
		() => ({ id: SIDEBAR_ROOT_SUBSECTION.CALENDARS, label: t('label.calendars', 'Calendars') }),
		[t]
	);

	// Generate "Tags" aggregator accordion item
	const tagsAggregatorItem: AccordionItemType = useMemo(
		() => ({
			id: 'tags-aggregator',
			items: tagsItems,
			CustomComponent: TagsAggregatorAccordionItem
		}),
		[tagsItems]
	);

	// Generate "Calendar groups" aggregator accordion item
	const calendarGroupsAggregatorItem: AccordionItemType = useMemo(
		() => ({
			id: SIDEBAR_ROOT_SUBSECTION.GROUPS,
			label: t('label.calendar_groups', 'Calendar groups'),
			items: calendarGroupsItems
		}),
		[t, calendarGroupsItems]
	);

	// Generate "Find shares" custom accordion item

	// Generate "Create group" custom accordion item

	const accountsItems = useSecondaryBarTreeAccounts();

	// Compose the accordion items
	return useMemo<Array<AccordionItemType>>(
		() => [...accountsItems, { id: '-', divider: true }, tagsAggregatorItem],
		[accountsItems, tagsAggregatorItem]
	);
};
