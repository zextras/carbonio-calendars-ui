/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, waitFor } from '@testing-library/react';
import { keyBy, values } from 'lodash';

import { AppointmentCardContainer } from './appointment-card-container';
import { useFolderStore } from '../../../carbonio-ui-commons/store/zustand/folder';
import { generateRoots } from '../../../carbonio-ui-commons/test/mocks/folders/roots-generator';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import * as getSearchRequestHandler from '../../../soap/search-request';
import { reducers } from '../../../store/redux';
import mockedData from '../../../test/generators';

const roots = generateRoots();
const rootsArray = values(roots);
const folder = mockedData.calendars.defaultCalendar;
const folder2 = mockedData.calendars.getCalendar();

const setupFoldersStore = (): void => {
	useFolderStore.setState(() => ({
		folders: {
			...keyBy(roots, 'id'),
			[folder.id]: folder,
			[folder2.id]: folder2
		}
	}));
};

describe('appointment card container component', () => {
	test('will call a search request', async () => {
		const start = new Date().getTime();
		const end = new Date().setUTCHours(15, 30, 0, 0);
		const searchRequestHandler = jest.spyOn(getSearchRequestHandler, 'searchRequest');
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupFoldersStore();
		setupTest(<AppointmentCardContainer start={start} end={end} rootId={rootsArray[1].id} />, {
			store
		});

		await waitFor(() => {
			expect(searchRequestHandler).toHaveBeenCalledTimes(1);
		});
	});
	test('will show a shimmer list while waiting for data', async () => {
		const start = new Date().getTime();
		const end = new Date().setUTCHours(15, 30, 0, 0);
		const store = configureStore({ reducer: combineReducers(reducers) });
		setupFoldersStore();
		setupTest(<AppointmentCardContainer start={start} end={end} rootId={rootsArray[1].id} />, {
			store
		});

		const shimmerList = screen.getByTestId(/ShimmerAppointmentCardContainer/i);
		expect(shimmerList).toBeVisible();
	});
});
