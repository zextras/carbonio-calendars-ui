/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import { initEvent } from '../../utils/store/editors';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const initializeAppointmentReducer = (state: any, { payload }: any): any => {
	const { id, panel, calendar, accounts, selectedStartTime, selectedEndTime } = payload;
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
};
