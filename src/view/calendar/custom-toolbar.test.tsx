/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { CalendarView, useAppStatusStore } from "../../store/zustand/store";
import { act } from "@testing-library/react";
import { setupTest } from "../../carbonio-ui-commons/test/test-setup";
import { CustomToolbar } from "./custom-toolbar";
import { reducers } from "../../store/redux";

const setupAppStatusStore = (): void => {
	useAppStatusStore.setState(() => ({ meetingRoom: undefined, equipment: undefined }));
};

describe('calendar toolbar', () => {
	test("onView with proper calendarView value is called while rendering the component", async () => {
		//setupAppStatusStore();
        let onViewCalendarView: undefined | CalendarView = undefined;
		const store = configureStore({ reducer: combineReducers(reducers) });
		    await act(async () => {
			setupTest(<CustomToolbar label="a label" onView={calendarView => { onViewCalendarView = calendarView }} onNavigate={() => {}} view="month" />, { store });
		});
		const state = useAppStatusStore.getState();
		expect(state.calendarView).toBe("month");
        expect(onViewCalendarView).toBe("month")
	});
})
