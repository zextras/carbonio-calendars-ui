/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getUserAccount } from '@zextras/carbonio-shell-ui';
import { getRootsArray } from '@zextras/carbonio-ui-commons';

import { AccountAccordionItem } from './custom-accordion-components/account-accordion-item';
import { useSecondaryBarTreePrimaryAccount } from './use-secondary-bar-tree-primary-account';
import { populateFoldersStore } from '../../__test__/mocks/store/folders';
import { setupHook } from '../../__test__/test-setup';
import { SIDEBAR_ROOT_SUBSECTION } from '../../constants/sidebar';
import { generateGroupCalendar, populateGroupsStore } from '../../test/generators/group';

describe('useSecondaryBarTreeAccounts', () => {
	it('should return an object with the correct structure', () => {
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
				{ id: SIDEBAR_ROOT_SUBSECTION.CALENDARS, label: 'Calendars', items: expect.any(Array) },
				{ id: SIDEBAR_ROOT_SUBSECTION.GROUPS, label: 'Groups', items: expect.any(Array) }
			]
		};

		// Assert the length of items in Calendars and Groups
		expect(result?.items?.[0].items).toHaveLength(accountRoots[0].children.length); // Assuming folders are directly under the primary account
		expect(result?.items?.[1].items).toHaveLength(groups.length + 1); // +1 for "All Calendars" group

		// Assert the overall structure
		expect(result).toEqual(expectedResult);
	});
});
