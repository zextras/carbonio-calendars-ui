/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Calendar } from '../../types/store/calendars';
import { EditorSlice } from '../../types/store/store';
import { initEvent } from '../../utils/store/editors';

type Payload = {
	payload: {
		id: string | undefined;
		panel: boolean;
		calendar: Calendar;
		accounts: Array<never>;
		selectedStartTime: number;
		selectedEndTime: number;
	};
};

export const initializeAppointmentReducer = (state: EditorSlice, { payload }: Payload): void => {
	const { id, panel, calendar, accounts, selectedStartTime, selectedEndTime } = payload;
	if (id) {
		state.editors[id] = initEvent({
			id,
			calendar,
			account: accounts[0],
			selectedStartTime,
			selectedEndTime
		});
		if (panel) {
			state.editorPanel = payload.id;
		}
	}
};
