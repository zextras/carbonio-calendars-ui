/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCallback, useMemo } from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';
import { useSortedTagsArray } from '@zextras/carbonio-ui-commons';

import { TagAccordionItem } from './custom-accordion-components/tag-accordion-item';
import { TagsAggregatorAccordionItem } from './custom-accordion-components/tags-aggregator-accordion-item';
import { useAccordionItemOpenStatusStorage } from './use-accordion-item-open-status-storage';
import { SIDEBAR_ITEMS } from '../../constants/sidebar';

export const useSecondaryBarTreeTags = (): Array<AccordionItemType> => {
	// Obtain the tags sorted list for the primary account
	const tags = useSortedTagsArray();

	// Generate tags accordion items
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

	const { isOpen, setOpenStatus } = useAccordionItemOpenStatusStorage();

	const onTagsAggregatorOpen = useCallback(() => {
		setOpenStatus(SIDEBAR_ITEMS.TAGS, true);
	}, [setOpenStatus]);

	const onTagsAggregatorClose = useCallback(() => {
		setOpenStatus(SIDEBAR_ITEMS.TAGS, false);
	}, [setOpenStatus]);

	// Generate and return the "Tags" aggregator accordion item
	return useMemo(
		() => [
			{
				id: SIDEBAR_ITEMS.TAGS,
				open: isOpen(SIDEBAR_ITEMS.TAGS),
				onOpen: onTagsAggregatorOpen,
				onClose: onTagsAggregatorClose,
				items: tagsItems,
				CustomComponent: TagsAggregatorAccordionItem
			}
		],
		[isOpen, onTagsAggregatorClose, onTagsAggregatorOpen, tagsItems]
	);
};
