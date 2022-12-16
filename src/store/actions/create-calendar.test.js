/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createCalendar } from './create-calendar';
import { reducers } from '../redux';

test('Create a new calendar', async () => {
	const calendar = { name: 'ciccio', parent: '1', color: 3, excludeFreeBusy: true };
	const store = configureStore({ reducer: combineReducers(reducers) });
	expect(store.getState().calendars.calendars).toEqual({});
	const { payload } = await store.dispatch(createCalendar(calendar));
	const updatedState = payload[0];
	expect(store.getState().calendars.calendars).toEqual(updatedState);
});
