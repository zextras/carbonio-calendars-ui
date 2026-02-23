/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { forEach } from 'lodash';

import { SharedAccountsAccordions } from './shared-accounts-accordions';
import { useLocalStorage } from '../../../__mocks__/@zextras/carbonio-shell-ui';
import { setupTest, screen } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';
import { getMocksContext } from '@test-utils/utils/mocks-context';
import { reducers } from 'store/redux';

describe('SharedAccountsAccordions', () => {
	it('should render the sendas of delegated accounts emails', () => {
		useLocalStorage.mockReturnValue([[], vi.fn()]);
		populateFoldersStore();
		const mockedContext = getMocksContext();
		const store = configureStore({
			reducer: combineReducers(reducers)
		});

		setupTest(<SharedAccountsAccordions />, { store });

		forEach(mockedContext.identities.sendAs, ({ identity: { email } }) => {
			expect(screen.getByText(email)).toBeVisible();
		});
	});

	it('should render the sendOnBehalf of delegated accounts emails', () => {
		useLocalStorage.mockReturnValue([[], vi.fn()]);
		populateFoldersStore();
		const mockedContext = getMocksContext();
		const store = configureStore({
			reducer: combineReducers(reducers)
		});

		setupTest(<SharedAccountsAccordions />, { store });

		forEach(mockedContext.identities.sendOnBehalf, ({ identity: { email } }) => {
			expect(screen.getByText(email)).toBeVisible();
		});
	});
});
