import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { CALENDAR_APP_ID } from '../../constants';
import { reducers } from '../redux';
import { createCalendar } from './create-calendar';

jest.setTimeout(50000);
test('Create a new calendar', async () => {
	const calendar = { name: 'ciccio', parent: '1', color: 3, excludeFreeBusy: true };
	const store = configureStore({
		devTools: {
			name: CALENDAR_APP_ID
		},
		reducer: combineReducers(reducers)
	});
	expect(store.getState().calendars.calendars).toEqual({});
	await store.dispatch(createCalendar(calendar));
	const response = 'ciao';
	const updatedState = response.payload[0];
	expect(store.getState().calendars.calendars).toEqual(updatedState);
});
