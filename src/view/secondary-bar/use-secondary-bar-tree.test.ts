/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { FOLDERS, getRootsArray, useTagStore } from '@zextras/carbonio-ui-commons';
import { map, times } from 'lodash';

import { AccountAccordionItem } from './custom-accordion-components/account-accordion-item';
import { TagAccordionItem } from './custom-accordion-components/tag-accordion-item';
import { TagsAggregatorAccordionItem } from './custom-accordion-components/tags-aggregator-accordion-item';
import { useSecondaryBarTree } from './use-secondary-bar-tree';
import { generateFolder } from '../../__test__/mocks/folders/folders-generator';
import { populateFoldersStore } from '../../__test__/mocks/store/folders';
import { tags } from '../../__test__/mocks/tags/tags';
import { getMocksContext } from '../../__test__/mocks/utils/mocks-context';
import { setupHook } from '../../__test__/test-setup';
import { CalendarGroup } from '../../store/zustand/calendar-group-store';
import { generateGroup, populateGroupsStore } from '../../test/generators/group';

describe('useSecondaryBarTree', () => {
	it('should return an object with the correct structure', () => {
		populateFoldersStore({ view: 'appointment' });
		const groupCalendars = times(faker.number.int({ min: 1, max: 10 }), (index) =>
			generateFolder({
				name: `Awesome${index}`
			})
		);
		const group: CalendarGroup = generateGroup({
			calendarId: groupCalendars.map((calendar) => calendar.id)
		});
		populateGroupsStore({
			groups: [group]
		});
		useTagStore.setState({ tags });

		const mockContext = getMocksContext();

		const {
			result: { current: result }
		} = setupHook(useSecondaryBarTree);

		const accountRoots = getRootsArray();

		const expectedTagsItems = map(tags, (tag) => ({
			id: tag.id,
			CustomComponent: TagAccordionItem
		}));

		const expectedPrimaryAccountItem = {
			id: FOLDERS.USER_ROOT,
			CustomComponent: AccountAccordionItem,
			items: expect.any(Array)
		};
		const expectedSharedAccountsItems = map(
			accountRoots.filter((account) => account.id !== FOLDERS.USER_ROOT),
			(account) => ({
				id: account.id,
				CustomComponent: AccountAccordionItem,
				items: expect.any(Array)
			})
		);
		const expectedTagsAggregatorItem = {
			id: 'tags-aggregator',
			CustomComponent: TagsAggregatorAccordionItem,
			items: expect.any(Array)
		};
		const expectedResult = [
			expectedPrimaryAccountItem,
			...expectedSharedAccountsItems,
			{ id: '-', divider: true },
			expectedTagsAggregatorItem
		];
		expect(result).toEqual(expectedResult);
	});
});
