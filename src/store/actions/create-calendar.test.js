import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createCalendar } from './create-calendar';
import { CALENDAR_APP_ID } from '../../constants';
import { reducers } from '../redux';

test('Create a new calendar', async () => {
	const calendar = { name: 'ciccio', parent: '1', color: 3, excludeFreeBusy: true };
	const store = configureStore({
		devTools: {
			name: CALENDAR_APP_ID
		},
		reducer: combineReducers(reducers)
	});
	expect(store.getState().calendars.calendars).toEqual({});
	const { payload } = await store.dispatch(createCalendar(calendar));
	const updatedState = payload[0];
	expect(store.getState().calendars.calendars).toEqual(updatedState);
});
