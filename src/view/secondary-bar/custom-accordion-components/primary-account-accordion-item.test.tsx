/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';

import { populateFoldersStore } from '../../../__test__/mocks/store/folders';
import { getMocksContext } from '../../../__test__/mocks/utils/mocks-context';
import { setupTest, screen } from '../../../__test__/test-setup';
import { TEST_SELECTORS } from '../../../constants/test-utils';

describe('AccountAccordionItem', () => {
	it('should render the account name', () => {
		populateFoldersStore();
		const primaryIdentity = getMocksContext().identities.primary;

		const item: AccordionItemType = {
			id: primaryIdentity.identity.id,
			label: primaryIdentity.identity.email
		};

		setupTest(<PrimaryAccountAccordionItem item={item} />);
		expect(screen.getByText(primaryIdentity.identity.email)).toBeVisible();
	});

	it('should render the account avatar', () => {
		// Test implementation		populateFoldersStore();
		const primaryIdentity = getMocksContext().identities.primary;

		const item: AccordionItemType = {
			id: primaryIdentity.identity.id,
			label: primaryIdentity.identity.email
		};

		setupTest(<PrimaryAccountAccordionItem item={item} />);
		expect(screen.getByTestId(TEST_SELECTORS.AVATAR_WRAPPER)).toBeVisible();
	});

	it('should render the calendars aggregator item', () => {
		populateFoldersStore();
		const primaryIdentity = getMocksContext().identities.primary;

		const item: AccordionItemType = {
			id: primaryIdentity.identity.id,
			label: primaryIdentity.identity.email
		};

		setupTest(<PrimaryAccountAccordionItem open item={item} />);
		expect(screen.getByText('Calendars')).toBeVisible();
	});

	it('should render the calendar groups aggregator item', () => {
		populateFoldersStore();
		const primaryIdentity = getMocksContext().identities.primary;

		const item: AccordionItemType = {
			id: primaryIdentity.identity.id,
			label: primaryIdentity.identity.email
		};

		setupTest(<PrimaryAccountAccordionItem open item={item} />);
		expect(screen.getByText('Calendar groups')).toBeVisible();
	});
});
