/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserAccount } from '@zextras/carbonio-shell-ui';
import { getRootsArray } from '@zextras/carbonio-ui-commons';

import { AccountAccordionItem } from './custom-accordion-components/account-accordion-item';
import { useSecondaryBarTreePrimaryAccount } from './use-secondary-bar-tree-primary-account';
import { useLocalStorage } from '../../../__mocks__/@zextras/carbonio-shell-ui';
import { populateFoldersStore } from '../../__test__/mocks/store/folders';
import { setupHook } from '../../__test__/test-setup';
import { SIDEBAR_ROOT_SUBSECTION } from '../../constants/sidebar';
import { generateGroupCalendar, populateGroupsStore } from '../../test/generators/group';

describe('useSecondaryBarTreePrimaryAccount', () => {
	it('should return an object with the correct structure', () => {
		// Mock the useLocalStorage hook to simulate localStorage containing the id '1'
		useLocalStorage.mockReturnValue([[], vi.fn()]);

		populateFoldersStore({ view: 'appointment' });
		const groups = [generateGroupCalendar()];
		populateGroupsStore({ groups });

		const account = getUserAccount();
		const accountRoots = getRootsArray();
		const primaryAccountRoot = accountRoots[0];

		const {
			result: { current: result }
		} = setupHook(useSecondaryBarTreePrimaryAccount);

		const expectedResult = {
			id: primaryAccountRoot.id,
			label: account?.name,
			CustomComponent: AccountAccordionItem,
			items: [
				{
					id: SIDEBAR_ROOT_SUBSECTION.CALENDARS,
					label: 'Calendars',
					items: expect.any(Array),
					onClose: expect.any(Function),
					onOpen: expect.any(Function),
					open: false
				},
				{
					id: SIDEBAR_ROOT_SUBSECTION.GROUPS,
					label: 'Calendar groups',
					items: expect.any(Array),
					onClose: expect.any(Function),
					onOpen: expect.any(Function),
					open: false
				}
			],
			onClose: expect.any(Function),
			onOpen: expect.any(Function),
			open: false
		};

		const calendarsItemsAndFindShares = accountRoots[0].children.length + 1; // Assuming folders are directly under the primary account
		const groupsAndAllCalendarsAndAddGroups = groups.length + 2; // +2 for "All Calendars" group and "Add Group" button
		// Assert the length of items in Calendars and Groups
		expect(result?.items?.[0].items).toHaveLength(calendarsItemsAndFindShares);
		expect(result?.items?.[1].items).toHaveLength(groupsAndAllCalendarsAndAddGroups);

		// Assert the overall structure
		expect(result).toEqual(expectedResult);
	});
});
