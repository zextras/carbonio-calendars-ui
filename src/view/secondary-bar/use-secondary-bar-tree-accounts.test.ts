/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getRootsArray } from '@zextras/carbonio-ui-commons';

import { AccountAccordionItem } from './custom-accordion-components/account-accordion-item';
import { useSecondaryBarTreeAccounts } from './use-secondary-bar-tree-accounts';
import { populateFoldersStore } from '../../__test__/mocks/store/folders';
import { setupHook } from '../../__test__/test-setup';

describe('useSecondaryBarTreeAccounts', () => {
	it('should return an object with the correct structure', () => {
		populateFoldersStore({ view: 'appointment' });
		const accountRoots = getRootsArray();
		const primaryAccountRoot = accountRoots[0];
		const sharedAccountRoots = accountRoots.slice(1);

		const {
			result: { current: result }
		} = setupHook(useSecondaryBarTreeAccounts);

		const expectedResult = [
			{
				id: primaryAccountRoot.id,
				CustomComponent: AccountAccordionItem,
				items: expect.any(Array)
			},
			...sharedAccountRoots.map((account) => ({
				id: account.id,
				CustomComponent: AccountAccordionItem,
				items: expect.any(Array)
			}))
		];

		expect(result).toEqual(expectedResult);
	});
});
