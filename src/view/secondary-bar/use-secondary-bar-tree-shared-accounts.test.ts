/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getRootsArray } from '@zextras/carbonio-ui-commons';

import { AccountAccordionItem } from './custom-accordion-components/account-accordion-item';
import { useSecondaryBarTreeSharedAccounts } from './use-secondary-bar-tree-shared-accounts';
import { populateFoldersStore } from '../../__test__/mocks/store/folders';
import { setupHook } from '../../__test__/test-setup';

describe('useSecondaryBarTreeAccount', () => {
	it('should return an object with the correct structure', () => {
		populateFoldersStore({ view: 'appointment' });

		const accountRoots = getRootsArray();
		const sharedAccountRoots = accountRoots.slice(1);

		const {
			result: { current: result }
		} = setupHook(useSecondaryBarTreeSharedAccounts);

		sharedAccountRoots.forEach((sharedAccount, i) => {
			expect(result[i]).toEqual({
				id: sharedAccount.id,
				label: sharedAccount.name,
				CustomComponent: AccountAccordionItem,
				items: expect.any(Array)
			});
			expect(result[i].items).toHaveLength(sharedAccount.children.length);
		});
	});
});
