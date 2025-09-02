/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo } from 'react';

import {
	Accordion,
	AccordionItemType,
	ModalManager,
	SnackbarManager
} from '@zextras/carbonio-design-system';
import { SecondaryBarComponentProps, useUserAccount } from '@zextras/carbonio-shell-ui';
import {
	FOLDERS,
	useRootsMap,
	useSortedTagsArray,
	ZIMBRA_STANDARD_COLORS
} from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { TagsAggregatorAccordionItem } from './custom-accordion-components/tags-aggregator-accordion-item';

const SecondaryBar: FC<SecondaryBarComponentProps> = ({ expanded }) => {
	const [t] = useTranslation();

	const onCalendarSelected = (calendarId: string) => {
		// Handle calendar selection
	};

	const onGroupSelected = (groupId: string) => {
		// Handle group selection
	};

	const onTagSelected = (tagId: string) => {
		// Handle tag selection
	};

	const { name: primaryAccountName } = useUserAccount();

	// Obtain the accounts list
	const allAccounts = useRootsMap();

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
						id: `tags-${tag.id}`,
						icon: 'Tag',
						iconColor: ZIMBRA_STANDARD_COLORS[tag.color || 0].hex,
						label: tag.name
					}) satisfies AccordionItemType
			),
		[tags]
	);

	// Generate calendar groups accordion item for the primary account

	// Generate "Calendar" aggregator accordion item for the primary account

	// Generate "Tags" aggregator accordion item
	const tagsAggregatorItem: AccordionItemType = useMemo(
		() => ({
			id: 'tags-aggregator',
			CustomComponent: TagsAggregatorAccordionItem
		}),
		[]
	);

	// Generate "Calendar groups" aggregator accordion item

	// Generate "Find shares" custom accordion item

	// Generate "Create group" custom accordion item

	// Generate calendars accordion items for primary account
	const primaryAccountItem = {
		id: `calendars-${FOLDERS.USER_ROOT}`,
		label: primaryAccountName
	} satisfies AccordionItemType;

	// Generate calendars accordion items for each shared account
	const sharedAccountsItems = sharedAccountsRoots.map(
		(account) =>
			({
				id: `calendars-${account.id}`,
				label: account.name
			}) satisfies AccordionItemType
	);

	// Compose the accordion items
	const accordionItems = useMemo<Array<AccordionItemType>>(
		() => [
			primaryAccountItem,
			...sharedAccountsItems,
			{ id: '-', divider: true },
			tagsAggregatorItem
		],
		[primaryAccountItem, sharedAccountsItems, tagsAggregatorItem]
	);

	return (
		<ModalManager>
			<SnackbarManager>
				<Accordion items={accordionItems} />
			</SnackbarManager>
		</ModalManager>
	);
};

export default SecondaryBar;
