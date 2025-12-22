/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import SecondaryBar from './secondary-bar';
import { useLocalStorage } from '../../../__mocks__/@zextras/carbonio-shell-ui';
import { populateFoldersStore } from '../../__test__/mocks/store/folders';
import { setupTest, screen } from '../../__test__/test-setup';
import { reducers } from '../../store/redux';

describe('SecondaryBar', () => {
	beforeAll(() => {
		useLocalStorage.mockReturnValue([[], vi.fn()]);
	});

	it('should render the expanded component and not the collapsed one', () => {
		populateFoldersStore();
		const store = configureStore({
			reducer: combineReducers(reducers)
		});

		setupTest(<SecondaryBar expanded />, { store });

		expect(screen.getByTestId('expanded-secondary-bar')).toBeVisible();
		expect(screen.queryByTestId('collapsed-secondary-bar')).not.toBeInTheDocument();
	});

	it('should render the collapsed component and not the expanded one', () => {
		populateFoldersStore();
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(<SecondaryBar expanded={false} />, { store });

		expect(screen.getByTestId('collapsed-secondary-bar')).toBeVisible();
		expect(screen.queryByTestId('expanded-secondary-bar')).not.toBeInTheDocument();
	});
});
