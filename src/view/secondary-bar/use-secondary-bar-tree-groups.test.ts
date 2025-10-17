/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CreateGroupAccordionItem } from './custom-accordion-components/create-group-accordion-item';
import { GroupAccordionItem } from './custom-accordion-components/group-accordion-item';
import { useSecondaryBarTreeGroups } from './use-secondary-bar-tree-groups';
import { generateFolder } from '../../__test__/mocks/folders/folders-generator';
import { populateFoldersStore } from '../../__test__/mocks/store/folders';
import { setupHook } from '../../__test__/test-setup';
import { SIDEBAR_ITEMS } from '../../constants/sidebar';
import { generateGroup, populateGroupsStore } from '../../test/generators/group';

describe('useSecondaryBarTreeGroups', () => {
	it('should return an object with the correct structure', () => {
		populateFoldersStore({
			view: 'appointment',
			customFolders: [
				generateFolder({
					name: 'All Calendars',
					id: SIDEBAR_ITEMS.ALL_CALENDAR,
					view: 'appointment'
				})
			]
		});
		const groups = [
			generateGroup({
				name: `ZZZZ Group`
			}),
			generateGroup({
				name: `aaaa Group`
			})
		];

		populateGroupsStore({
			groups
		});

		const {
			result: { current: result }
		} = setupHook(useSecondaryBarTreeGroups);

		const expectedResult = [
			{
				id: SIDEBAR_ITEMS.ALL_CALENDAR,
				label: 'All calendars',
				CustomComponent: GroupAccordionItem
			},
			{
				id: groups[1].id,
				label: groups[1].name,
				CustomComponent: GroupAccordionItem
			},
			{
				id: groups[0].id,
				label: groups[0].name,
				CustomComponent: GroupAccordionItem
			},
			{
				id: 'add-group',
				disableHover: true,
				CustomComponent: CreateGroupAccordionItem
			}
		];
		expect(result).toEqual(expectedResult);
	});
});
