/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import React, { FC } from 'react';
import { Provider } from 'react-redux';
import { CALENDAR_APP_ID } from '../../constants';
import appointmentsSliceReducer from '../slices/appointments-slice';
import calendarsSliceReducer from '../slices/calendars-slice';
import editorSliceReducer from '../slices/editor-slice';
import invitesSliceReducer from '../slices/invites-slice';

export const reducers = {
	appointments: appointmentsSliceReducer,
	calendars: calendarsSliceReducer,
	editor: editorSliceReducer,
	invites: invitesSliceReducer
};

const store = configureStore({
	devTools: {
		name: CALENDAR_APP_ID
	},
	// middleware: __CARBONIO_DEV__
	// 	? // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	// 	  (getDefaultMiddleware) => getDefaultMiddleware().concat(logger)
	// 	: // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	// 	  (getDefaultMiddleware) => getDefaultMiddleware(),
	reducer: combineReducers(reducers)
});

export const StoreProvider: FC = ({ children }) => <Provider store={store}>{children}</Provider>;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
