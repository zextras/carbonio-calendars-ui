/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act } from '@testing-library/react';

import { CustomToolbar } from './custom-toolbar';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { reducers } from '../../store/redux';
import { CalendarView, useAppStatusStore } from '../../store/zustand/store';

describe('calendar toolbar', () => {
	test('onView with proper calendarView value is called while rendering the component', async () => {
		let onViewCalendarView: undefined | CalendarView;
		const store = configureStore({ reducer: combineReducers(reducers) });
		await act(async () => {
			setupTest(
				<CustomToolbar
					label="a label"
					onView={(calendarView) => {
						onViewCalendarView = calendarView;
					}}
					onNavigate={() => {}}
					view="month"
				/>,
				{ store }
			);
		});
		const state = useAppStatusStore.getState();
		expect(state.calendarView).toBe('month');
		expect(onViewCalendarView).toBe('month');
	});
});
