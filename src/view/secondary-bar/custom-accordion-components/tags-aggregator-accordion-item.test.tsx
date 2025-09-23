/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';

import { TagsAggregatorAccordionItem } from './tags-aggregator-accordion-item';
import { setupTest, screen } from '../../../__test__/test-setup';
import { SIDEBAR_ITEMS } from '../../../constants/sidebar';
import { TEST_SELECTORS } from '../../../constants/test-utils';

describe('TagsAggregatorAccordionItem', () => {
	it('should render correctly', () => {
		const item: AccordionItemType = {
			id: SIDEBAR_ITEMS.TAGS
		};

		setupTest(<TagsAggregatorAccordionItem item={item} />);

		expect(screen.getByText('Tags')).toBeVisible();
		expect(screen.getByTestId(TEST_SELECTORS.ICONS.tags)).toBeVisible();
	});

	describe('Actions contextual menu', () => {
		it('should open on right-click', async () => {
			const item: AccordionItemType = {
				id: 'tags-aggregator'
			};

			const { user } = setupTest(<TagsAggregatorAccordionItem item={item} />);
			const tagsAccordionItem = screen.getByText('Tags');

			expect(screen.queryByTestId('dropdown-popper-list')).not.toBeInTheDocument();

			await user.rightClick(tagsAccordionItem);

			expect(screen.getByTestId('dropdown-popper-list')).toBeVisible();
		});

		it('should display a create tag option', async () => {
			const item: AccordionItemType = {
				id: 'tags-aggregator'
			};

			const { user } = setupTest(<TagsAggregatorAccordionItem item={item} />);
			const tagsAccordionItem = screen.getByText('Tags');
			await user.rightClick(tagsAccordionItem);

			expect(screen.getByText('label.create_tag')).toBeVisible();
		});
	});
});
