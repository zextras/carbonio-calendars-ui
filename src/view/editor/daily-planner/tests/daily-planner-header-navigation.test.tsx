/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { TEST_SELECTORS } from '../../../../constants/test-utils';
import { reducers } from '../../../../store/redux';
import * as STORE_API from '../../../../store/slices/editor-slice';
import { DailyPlannerHeaderNavigation } from '../daily-planner-header-navigation';
import { screen, setupTest } from '@test-setup';

describe('DailyPlannerHeaderNavigation', () => {
	it('will render a reset button', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(<DailyPlannerHeaderNavigation editorId={'1'} startDate={0} endDate={0} />, { store });
		const todayButton = screen.getByRole('button', { name: /Reset Date/i });
		expect(todayButton).toBeVisible();
	});
	it('will render a left arrow button', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(<DailyPlannerHeaderNavigation editorId={'1'} startDate={0} endDate={0} />, { store });
		const leftArrowButton = screen.getByRoleWithIcon('button', {
			icon: TEST_SELECTORS.ICONS.leftArrow
		});
		expect(leftArrowButton).toBeVisible();
	});
	it('will render a right arrow button', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(<DailyPlannerHeaderNavigation editorId={'1'} startDate={0} endDate={0} />, { store });
		const rightArrowButton = screen.getByRoleWithIcon('button', {
			icon: TEST_SELECTORS.ICONS.rightArrow
		});
		expect(rightArrowButton).toBeVisible();
	});
	it('will render a localized date', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(<DailyPlannerHeaderNavigation editorId={'1'} startDate={0} endDate={0} />, { store });
		const dateLabel = screen.getByRole('button', { name: /Thursday, January 1, 1970/i });
		expect(dateLabel).toBeVisible();
	});
	it('will navigate to previous day clicking the left arrow button', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		const { user } = setupTest(
			<DailyPlannerHeaderNavigation editorId={'1'} startDate={0} endDate={0} />,
			{ store }
		);
		const leftArrowButton = screen.getByRoleWithIcon('button', {
			icon: TEST_SELECTORS.ICONS.leftArrow
		});
		await user.click(leftArrowButton);
		const dateLabel = screen.getByRole('button', { name: /Wednesday, December 31, 1969/i });

		expect(dateLabel).toBeVisible();
	});
	it('will navigate to next day clicking the right arrow button', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		const { user } = setupTest(
			<DailyPlannerHeaderNavigation editorId={'1'} startDate={0} endDate={0} />,
			{ store }
		);
		const rightArrowButton = screen.getByRoleWithIcon('button', {
			icon: TEST_SELECTORS.ICONS.rightArrow
		});
		await user.click(rightArrowButton);
		const dateLabel = screen.getByRole('button', { name: /Friday, January 2, 1970/i });

		expect(dateLabel).toBeVisible();
	});
	it('will reset navigation to starting date clicking the reset button', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		const { user } = setupTest(
			<DailyPlannerHeaderNavigation editorId={'1'} startDate={0} endDate={0} />,
			{ store }
		);
		const rightArrowButton = screen.getByRoleWithIcon('button', {
			icon: TEST_SELECTORS.ICONS.rightArrow
		});
		const resetButton = screen.getByRole('button', { name: /Reset Date/i });
		await user.click(rightArrowButton);
		await user.click(rightArrowButton);
		const dateLabel = screen.getByRole('button', { name: /Saturday, January 3, 1970/i });
		expect(dateLabel).toBeVisible();

		await user.click(resetButton);

		const initialDateLabel = screen.getByRole('button', { name: /Thursday, January 1, 1970/i });
		expect(initialDateLabel).toBeVisible();
	});
	it('will debounce every click to set the new value in store once', async () => {
		const callbackToSetNewValueInStore = jest.spyOn(STORE_API, 'editEditorDate');

		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		const { user } = setupTest(
			<DailyPlannerHeaderNavigation editorId={'1'} startDate={0} endDate={0} />,
			{ store }
		);
		const rightArrowButton = screen.getByRoleWithIcon('button', {
			icon: TEST_SELECTORS.ICONS.rightArrow
		});
		await user.click(rightArrowButton);
		await user.click(rightArrowButton);
		await user.click(rightArrowButton);
		await user.click(rightArrowButton);

		jest.advanceTimersByTime(300);
		expect(callbackToSetNewValueInStore).toHaveBeenCalledTimes(1);
	});
});
