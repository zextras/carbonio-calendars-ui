/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Store } from 'redux';

import { generateEditor } from '../../../../commons/editor-generator';
import { TEST_SELECTORS } from '../../../../constants/test-utils';
import { reducers, RootState } from '../../../../store/redux';
import mockedData from '../../../../test/generators';
import {
	DailyPlannerHeaderNavigation,
	ONE_DAY_IN_MILLIS
} from '../daily-planner-header-navigation';
import { screen, setupTest } from '@test-setup';

const setStore = (): {
	store: Store<RootState>;
	editorId: string;
} => {
	const store = configureStore({
		reducer: combineReducers(reducers)
	});
	const folder = {
		absFolderPath: '/Test',
		id: '5',
		l: '1',
		name: 'Test',
		view: 'appointment'
	};
	const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

	const editor = generateEditor({
		context: {
			originalStart: 0,
			originalEnd: 0,
			folders,
			dispatch: store.dispatch
		}
	});
	return { store, editorId: editor.id };
};
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
		vi.setSystemTime(new Date('1970-01-01T00:00:00.000Z'));

		const store = configureStore({
			reducer: combineReducers(reducers)
		});
		setupTest(<DailyPlannerHeaderNavigation editorId={'1'} startDate={0} endDate={0} />, { store });
		const dateLabel = screen.getByRole('button', { name: /Thursday, January 1, 1970/i });
		expect(dateLabel).toBeVisible();
	});
	it('will subtract 1 day to stored date clicking the left arrow button', async () => {
		const { store, editorId } = setStore();

		const { user } = setupTest(
			<DailyPlannerHeaderNavigation editorId={editorId} startDate={0} endDate={0} />,
			{ store }
		);
		const leftArrowButton = screen.getByRoleWithIcon('button', {
			icon: TEST_SELECTORS.ICONS.leftArrow
		});
		await user.click(leftArrowButton);
		const editorStore = store.getState().editor.editors;
		expect(editorStore[editorId].start).toEqual(-ONE_DAY_IN_MILLIS);
	});
	it('will add 1 day to stored date clicking the right arrow button', async () => {
		const { store, editorId } = setStore();

		const { user } = setupTest(
			<DailyPlannerHeaderNavigation editorId={editorId} startDate={0} endDate={0} />,
			{ store }
		);
		const rightArrowButton = screen.getByRoleWithIcon('button', {
			icon: TEST_SELECTORS.ICONS.rightArrow
		});
		await user.click(rightArrowButton);

		const editorStore = store.getState().editor.editors;
		expect(editorStore[editorId].start).toEqual(ONE_DAY_IN_MILLIS);
	});
	it('will reset the date to its original date clicking the reset button', async () => {
		const { store, editorId } = setStore();

		const { user, rerender } = setupTest(
			<DailyPlannerHeaderNavigation editorId={editorId} startDate={0} endDate={0} />,
			{ store }
		);

		await user.click(
			screen.getByRoleWithIcon('button', {
				icon: TEST_SELECTORS.ICONS.rightArrow
			})
		);

		rerender(
			<DailyPlannerHeaderNavigation
				editorId={editorId}
				startDate={ONE_DAY_IN_MILLIS}
				endDate={ONE_DAY_IN_MILLIS}
			/>
		);

		await user.click(
			screen.getByRoleWithIcon('button', {
				icon: TEST_SELECTORS.ICONS.rightArrow
			})
		);

		expect(store.getState().editor.editors[editorId].start).toEqual(ONE_DAY_IN_MILLIS * 2);

		rerender(
			<DailyPlannerHeaderNavigation
				editorId={editorId}
				startDate={ONE_DAY_IN_MILLIS * 2}
				endDate={ONE_DAY_IN_MILLIS * 2}
			/>
		);

		await user.click(screen.getByRole('button', { name: /Reset Date/i }));

		expect(store.getState().editor.editors[editorId].start).toEqual(0);
	});
});
