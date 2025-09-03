/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useTagStore } from '@zextras/carbonio-ui-commons';

import SecondaryBar from './secondary-bar';
import { populateFoldersStore } from '../../__test__/mocks/store/folders';
import { tags } from '../../__test__/mocks/tags/tags';
import { getMocksContext } from '../../__test__/mocks/utils/mocks-context';
import { setupTest, screen } from '../../__test__/test-setup';

describe('SecondaryBar', () => {
	it('should render the primary account accordion item', () => {
		const primaryIdentity = getMocksContext().identities.primary;
		populateFoldersStore();

		setupTest(<SecondaryBar expanded />);

		expect(screen.getByText(primaryIdentity.identity.email)).toBeVisible();
	});

	it('should render the shared accounts accordion items', () => {
		const sharedIdentities = getMocksContext().identities.sendAs;
		populateFoldersStore();

		setupTest(<SecondaryBar expanded />);

		sharedIdentities.forEach((shaedIdentity) => {
			expect(screen.getByText(shaedIdentity.identity.email)).toBeVisible();
		});
	});

	it('should render the divider', () => {
		setupTest(<SecondaryBar expanded />);

		expect(screen.getByTestId('divider')).toBeVisible();
	});

	it('should render the tags aggregator accordion item', () => {
		populateFoldersStore();
		useTagStore.setState({ tags });

		setupTest(<SecondaryBar expanded />);

		expect(screen.getByText('Tags')).toBeVisible();
	});

	it.todo(
		'should render only the primary accounts calendars icons when the secondary bar is expanded'
	);
});
