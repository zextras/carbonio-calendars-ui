/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';

import { AccountAccordionItem } from './account-accordion-item';
import { populateFoldersStore } from '../../../__test__/mocks/store/folders';
import { getMocksContext } from '../../../__test__/mocks/utils/mocks-context';
import { setupTest, screen } from '../../../__test__/test-setup';
import { TEST_SELECTORS } from '../../../constants/test-utils';

describe('AccountAccordionItem', () => {
	populateFoldersStore();
	const primaryIdentity = getMocksContext().identities.primary;

	const item: AccordionItemType = {
		id: primaryIdentity.identity.id,
		label: primaryIdentity.identity.email,
		open: true,
		CustomComponent: AccountAccordionItem
	};

	it('should render the account name', () => {
		setupTest(<AccountAccordionItem item={item} />);

		expect(screen.getByText(primaryIdentity.identity.email)).toBeVisible();
	});

	it('should render the account avatar', () => {
		setupTest(<AccountAccordionItem item={item} />);

		expect(screen.getByTestId(TEST_SELECTORS.AVATAR)).toBeVisible();
	});
});
