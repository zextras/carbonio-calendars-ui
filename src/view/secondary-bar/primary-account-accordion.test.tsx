/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { PrimaryAccountAccordion } from './primary-account-accordion';
import { useLocalStorage } from '../../../__mocks__/@zextras/carbonio-shell-ui';
import { setupTest, screen } from '@test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';
import { getMocksContext } from '@test-utils/utils/mocks-context';
import { reducers } from 'store/redux';

describe('PrimaryAccountAccordion', () => {
	it('should render the primary account email', () => {
		useLocalStorage.mockReturnValue([[], vi.fn()]);
		populateFoldersStore();
		const mockedContext = getMocksContext();
		const store = configureStore({
			reducer: combineReducers(reducers)
		});

		setupTest(<PrimaryAccountAccordion />, { store });

		expect(screen.getByText(mockedContext.identities.primary.identity.email)).toBeVisible();
	});
});
