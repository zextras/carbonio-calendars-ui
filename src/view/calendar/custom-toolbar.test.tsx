/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act } from '@testing-library/react';

import { CustomToolbar } from './custom-toolbar';
import { useLocalStorage } from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { setupTest, screen } from '../../carbonio-ui-commons/test/test-setup';
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
					onView={(calendarView): void => {
						onViewCalendarView = calendarView;
					}}
					onNavigate={jest.fn()}
					view="month"
				/>,
				{ store }
			);
		});

		const state = useAppStatusStore.getState();

		expect(state.calendarView).toBe('month');
		expect(onViewCalendarView).toBe('month');
	});

	describe('Calendars split view', () => {
		useLocalStorage.mockReturnValue([false, jest.fn()]);

		test('should render the button to enable calendars split view', async () => {
			await act(async () => {
				setupTest(
					<CustomToolbar label="a label" onView={jest.fn()} onNavigate={jest.fn()} view="month" />
				);
			});

			expect(screen.getByRoleWithIcon('button', { icon: 'icon: WeekViewOutline' })).toBeVisible();
		});

		test('should be disabled if calendarView is not set to day', async () => {
			await act(async () => {
				setupTest(
					<CustomToolbar label="a label" onView={jest.fn()} onNavigate={jest.fn()} view="month" />
				);
			});

			expect(screen.getByRoleWithIcon('button', { icon: 'icon: WeekViewOutline' })).toBeDisabled();
		});

		test('should be enabled if calendarView is set to day', async () => {
			await act(async () => {
				setupTest(
					<CustomToolbar label="a label" onView={jest.fn()} onNavigate={jest.fn()} view="day" />
				);
			});

			expect(screen.getByRoleWithIcon('button', { icon: 'icon: WeekViewOutline' })).toBeEnabled();
		});
	});
});
