/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { initEvent } from '../../utils/store/editors';

export const initializeEditorAppointment = createAsyncThunk(
	'editor/initializeEditorAppointment',
	({
		id,
		panel,
		calendar,
		accounts,
		selectedStartTime,
		selectedEndTime
	}: any): { id: string; panel: string; appt: any } => ({
		id,
		panel,
		appt: initEvent({ id, calendar, account: accounts[0], selectedStartTime, selectedEndTime })
	})
);
