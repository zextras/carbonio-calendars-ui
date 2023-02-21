/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSlice } from '@reduxjs/toolkit';
import produce from 'immer';
import moment from 'moment';
import { Calendar } from '../../types/store/calendars';
import { CalendarSlice } from '../../types/store/store';
import { folderAction } from '../actions/calendar-actions';
import { createCalendar } from '../actions/create-calendar';
import { getFolder } from '../actions/get-folder';
import { shareCalendar } from '../actions/share-calendar';
import {
	folderActionFullFilled,
	folderActionPending,
	folderActionRejected
} from '../reducers/calendar-actions';
import {
	createCalendarFullFilled,
	createCalendarPending,
	createCalendarRejected
} from '../reducers/create-calendar';
import { getFolderFullFilled } from '../reducers/get-folder';
import { handleCreatedCalendarsReducer } from '../reducers/handle-created-calendars';
import { handleDeletedCalendarsReducer } from '../reducers/handle-deleted-calendars';
import { handleModifiedCalendarsReducer } from '../reducers/handle-modified-calendars';
import { handleCalendarsRefreshReducer } from '../reducers/handle-sync';
import { setRangeReducer } from '../reducers/set-range';
import { shareCalenderFullFilled } from '../reducers/share-calender-reducers';
import { handleUpdateCalendar } from '../reducers/update-calendar';

const initialState: CalendarSlice = {
	status: 'idle',
	calendars: {} as Record<string, Calendar>,
	start: moment().subtract('7', 'days').valueOf(),
	end: moment().add('15', 'days').valueOf()
};

export const calendarsSlice = createSlice({
	name: 'calendars',
	initialState,
	reducers: {
		handleCreatedCalendars: produce(handleCreatedCalendarsReducer),
		handleModifiedCalendars: produce(handleModifiedCalendarsReducer),
		handleDeletedCalendars: produce(handleDeletedCalendarsReducer),
		handleCalendarsRefresh: handleCalendarsRefreshReducer,
		setRange: setRangeReducer,
		updateCalendar: handleUpdateCalendar
	},
	extraReducers: (builder) => {
		builder.addCase(createCalendar.pending, createCalendarPending);
		builder.addCase(createCalendar.fulfilled, createCalendarFullFilled);
		builder.addCase(createCalendar.rejected, createCalendarRejected);
		builder.addCase(getFolder.fulfilled, getFolderFullFilled);
		builder.addCase(folderAction.fulfilled, folderActionFullFilled);
		builder.addCase(folderAction.pending, folderActionPending);
		builder.addCase(folderAction.rejected, folderActionRejected);
		builder.addCase(shareCalendar.fulfilled, shareCalenderFullFilled);
	}
});

export const {
	updateCalendar,
	handleCreatedCalendars,
	handleModifiedCalendars,
	handleDeletedCalendars,
	handleCalendarsRefresh,
	setRange
} = calendarsSlice.actions;

export default calendarsSlice.reducer;
