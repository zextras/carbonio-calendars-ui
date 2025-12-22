/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act } from '@testing-library/react';

import { useLocalStorage } from '../../../../__mocks__/@zextras/carbonio-shell-ui';
import { reducers } from '../../../store/redux';
import { CalendarView, useAppStatusStore } from '../../../store/zustand/store';
import { CustomToolbar } from '../custom-toolbar';
import { setupTest, screen } from '@test-setup';

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
					onNavigate={vi.fn()}
					view="month"
				/>,
				{ store }
			);
		});

		const state = useAppStatusStore.getState();

		expect(state.calendarView).toBe('month');
		expect(onViewCalendarView).toBe('month');
	});

	describe('Calendars split view button', () => {
		useLocalStorage.mockReturnValue([false, vi.fn()]);

		test('should render the button to enable calendars split view', () => {
			setupTest(
				<CustomToolbar label="a label" onView={vi.fn()} onNavigate={vi.fn()} view="month" />
			);

			expect(screen.getByRoleWithIcon('button', { icon: 'icon: WeekViewOutline' })).toBeVisible();
		});

		test('should be disabled if calendarView is not set to day', () => {
			setupTest(
				<CustomToolbar label="a label" onView={vi.fn()} onNavigate={vi.fn()} view="month" />
			);

			expect(screen.getByRoleWithIcon('button', { icon: 'icon: WeekViewOutline' })).toBeDisabled();
		});

		test('should be enabled if calendarView is set to day', () => {
			setupTest(<CustomToolbar label="a label" onView={vi.fn()} onNavigate={vi.fn()} view="day" />);

			expect(screen.getByRoleWithIcon('button', { icon: 'icon: WeekViewOutline' })).toBeEnabled();
		});

		test('should display a specific tooltip if it is disabled', async () => {
			const { user } = setupTest(
				<CustomToolbar label="a label" onView={vi.fn()} onNavigate={vi.fn()} view="month" />
			);

			await user.hover(screen.getByRoleWithIcon('button', { icon: 'icon: WeekViewOutline' }));
			const tooltip = await screen.findByText('Split layout not available in the current view');

			expect(tooltip).toBeVisible();
		});

		test('should display a specific tooltip if it is enabled and the split is not active yet', async () => {
			useLocalStorage.mockReturnValue([false, vi.fn()]);

			const { user } = setupTest(
				<CustomToolbar label="a label" onView={vi.fn()} onNavigate={vi.fn()} view="day" />
			);

			await user.hover(screen.getByRoleWithIcon('button', { icon: 'icon: WeekViewOutline' }));
			const tooltip = await screen.findByText('Enable split layout');

			expect(tooltip).toBeVisible();
		});

		test('should display a specific tooltip if it is enabled and the split is already active', async () => {
			useLocalStorage.mockReturnValue([true, vi.fn()]);

			const { user } = setupTest(
				<CustomToolbar label="a label" onView={vi.fn()} onNavigate={vi.fn()} view="day" />
			);

			await user.hover(screen.getByRoleWithIcon('button', { icon: 'icon: WeekViewOutline' }));
			const tooltip = await screen.findByText('Disable split layout');

			expect(tooltip).toBeVisible();
		});
	});
});
