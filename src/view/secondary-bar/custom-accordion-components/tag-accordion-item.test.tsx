/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { AccordionItemType } from '@zextras/carbonio-design-system';
import {
	Tag,
	useRunSearchIntegration,
	useTagStore,
	ZIMBRA_STANDARD_COLORS
} from '@zextras/carbonio-ui-commons';

import { TagAccordionItem } from './tag-accordion-item';
import { setupTest, screen } from '../../../__test__/test-setup';
import { TEST_SELECTORS } from '../../../constants/test-utils';

const generateTag = (model: Partial<Tag> = {}): Tag => ({
	id: model.id || faker.string.uuid(),
	name: model.name || faker.word.words(2),
	color: model.color || faker.number.int({ min: 0, max: 9 }),
	n: model.n || faker.number.int({ min: 0, max: 1000 })
});

vi.mock('@zextras/carbonio-ui-commons', async () => ({
	...(await vi.importActual('@zextras/carbonio-ui-commons')),
	useRunSearchIntegration: vi.fn()
}));

describe('TagAccordionItem', () => {
	it('should render the tag accordion item with the correct label and icon', () => {
		const tag = generateTag();
		const tags = {
			[tag.id]: tag
		};
		useTagStore.setState({ tags });

		const item: AccordionItemType = {
			id: tag.id,
			label: tag.name
		};

		setupTest(<TagAccordionItem item={item} />);

		expect(screen.getByText(tag.name)).toBeVisible();
		expect(screen.getByTestId(TEST_SELECTORS.ICONS.tag)).toBeVisible();
		expect(screen.getByTestId(TEST_SELECTORS.ICONS.tag)).toHaveStyleRule(
			'color',
			ZIMBRA_STANDARD_COLORS[tag.color ?? 0].hex
		);
	});

	it('should trigger the search when the tag is clicked', async () => {
		const runSearchSpy = vi.fn();
		vi.mocked(useRunSearchIntegration).mockReturnValue(runSearchSpy);

		const tag = generateTag();
		const tags = {
			[tag.id]: tag
		};
		useTagStore.setState({ tags });

		const item: AccordionItemType = {
			id: tag.id,
			label: tag.name
		};

		const { user } = setupTest(<TagAccordionItem item={item} />);
		await user.click(screen.getByText(tag.name));

		expect(runSearchSpy).toHaveBeenCalledWith(
			expect.arrayContaining([
				{
					avatarBackground: ZIMBRA_STANDARD_COLORS[tag.color || 0].hex,
					avatarIcon: 'Tag',
					background: 'gray2',
					hasAvatar: true,
					label: `tag:${tag.name}`,
					value: `tag:"${tag.name}"`
				}
			]),
			'calendars'
		);
	});
});
