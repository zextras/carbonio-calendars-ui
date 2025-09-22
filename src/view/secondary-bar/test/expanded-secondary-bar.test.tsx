/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useTagStore } from '@zextras/carbonio-ui-commons';

import { populateFoldersStore } from '../../../__test__/mocks/store/folders';
import { tags } from '../../../__test__/mocks/tags/tags';
import { getMocksContext } from '../../../__test__/mocks/utils/mocks-context';
import { setupTest, screen } from '../../../__test__/test-setup';
import { ExpandedSecondaryBar } from '../expanded-secondary-bar';

describe('ExpandedSecondaryBar', () => {
	it('should render the primary account accordion item', () => {
		const primaryIdentity = getMocksContext().identities.primary;
		populateFoldersStore();

		setupTest(<ExpandedSecondaryBar />);

		expect(screen.getByText(primaryIdentity.identity.email)).toBeVisible();
	});

	it('should render the shared accounts accordion items', () => {
		const sharedIdentities = getMocksContext().identities.sendAs;
		populateFoldersStore();

		setupTest(<ExpandedSecondaryBar />);

		sharedIdentities.forEach((sharedIdentity) => {
			expect(screen.getByText(sharedIdentity.identity.email)).toBeVisible();
		});
	});

	it('should render the divider', () => {
		setupTest(<ExpandedSecondaryBar />);

		expect(screen.getByTestId('divider')).toBeVisible();
	});

	it('should render the tags aggregator accordion item', () => {
		populateFoldersStore();
		useTagStore.setState({ tags });

		setupTest(<ExpandedSecondaryBar />);

		expect(screen.getByText('Tags')).toBeVisible();
	});

	it.todo(
		'should render only the primary accounts calendars icons when the secondary bar is expanded'
	);
});
