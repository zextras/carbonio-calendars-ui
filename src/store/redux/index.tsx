/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import React, { FC } from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { CALENDAR_APP_ID } from '../../constants';
import invitesSliceReducer from '../slices/invites-slice';
import editorSliceReducer from '../slices/editor-slice';
import appointmentsSliceReducer from '../slices/appointments-slice';

export const reducers = {
	appointments: appointmentsSliceReducer,
	editor: editorSliceReducer,
	invites: invitesSliceReducer
};

const store: Store = configureStore({
	devTools: {
		name: CALENDAR_APP_ID
	},
	reducer: combineReducers(reducers)
});

export const StoreProvider: FC = ({ children }) => <Provider store={store}>{children}</Provider>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
