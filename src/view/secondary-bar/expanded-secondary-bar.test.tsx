/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useTagStore } from '@zextras/carbonio-ui-commons';

import { ExpandedSecondaryBar } from './expanded-secondary-bar';
import { useLocalStorage } from '../../../__mocks__/@zextras/carbonio-shell-ui';
import { populateFoldersStore } from '../../__test__/mocks/store/folders';
import { tags } from '../../__test__/mocks/tags/tags';
import { getMocksContext } from '../../__test__/mocks/utils/mocks-context';
import { setupTest, screen } from '../../__test__/test-setup';
import { reducers } from 'store/redux';

beforeAll(() => {
	useLocalStorage.mockReturnValue([[], vi.fn()]);
});

describe('ExpandedSecondaryBar', () => {
	it('should render the primary account accordion item', () => {
		const primaryIdentity = getMocksContext().identities.primary;
		populateFoldersStore();
		const store = configureStore({
			reducer: combineReducers(reducers)
		});

		setupTest(<ExpandedSecondaryBar />, { store });

		expect(screen.getByText(primaryIdentity.identity.email)).toBeVisible();
	});

	it('should render the shared accounts accordion items', () => {
		const sharedIdentities = getMocksContext().identities.sendAs;
		populateFoldersStore();
		const store = configureStore({
			reducer: combineReducers(reducers)
		});

		setupTest(<ExpandedSecondaryBar />, { store });

		sharedIdentities.forEach((sharedIdentity) => {
			expect(screen.getByText(sharedIdentity.identity.email)).toBeVisible();
		});
	});

	it('should render the divider', () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});

		setupTest(<ExpandedSecondaryBar />, { store });

		expect(screen.getByTestId('divider')).toBeVisible();
	});

	it('should render the tags aggregator accordion item', () => {
		populateFoldersStore();
		const store = configureStore({
			reducer: combineReducers(reducers)
		});

		useTagStore.setState({ tags });

		setupTest(<ExpandedSecondaryBar />, { store });

		expect(screen.getByText('Tags')).toBeVisible();
	});
});
