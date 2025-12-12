/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useTagStore } from '@zextras/carbonio-ui-commons';

import { TagsAccordion } from './tags-accordion';
import { useLocalStorage } from '../../../__mocks__/@zextras/carbonio-shell-ui';
import { setupTest, screen } from '../../__test__/test-setup';
import { populateFoldersStore } from '@test-utils/store/folders';
import { SIDEBAR_ITEMS } from 'constants/sidebar';
import { reducers } from 'store/redux';

describe('TagsAccordion', () => {
	it('should render the tags accordion with the correct items', () => {
		useLocalStorage.mockReturnValue([[SIDEBAR_ITEMS.TAGS], vi.fn()]);
		populateFoldersStore();
		const store = configureStore({
			reducer: combineReducers(reducers)
		});

		const tags = {
			'1': {
				id: '1',
				name: 'ZZZZ AAAA',
				color: 4,
				n: 46
			},
			'9999': {
				id: '9999',
				name: 'AAAA BBBB',
				color: 5,
				n: 23
			}
		};
		useTagStore.setState({ tags });

		setupTest(<TagsAccordion />, { store });

		expect(screen.getByText('Tags')).toBeVisible();

		expect(screen.getByText('AAAA BBBB')).toBeVisible();
		expect(screen.getByText('ZZZZ AAAA')).toBeVisible();
	});
});
