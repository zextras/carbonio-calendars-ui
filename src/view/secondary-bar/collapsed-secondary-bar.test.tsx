/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { getFolders } from '@zextras/carbonio-ui-commons';

import { CollapsedSecondaryBar } from './collapsed-secondary-bar';
import { populateFoldersStore } from '../../__test__/mocks/store/folders';
import { setupTest, screen } from '../../__test__/test-setup';
import { reducers } from '../../store/redux';

describe('CollapsedSecondaryBar', () => {
	it('should render an icon for each calendar of the primary account', () => {
		populateFoldersStore();
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		const folders = getFolders();

		setupTest(<CollapsedSecondaryBar />, { store });
		const calendarItems = screen.getAllByRole('button');

		expect(calendarItems).toHaveLength(folders[0].children.length);
	});
});
