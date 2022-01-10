/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handleCreateAppointmentFulfilled = (state: any, { payload }: any): any => {
	const { id, appt, panel } = payload;
	state.editors[id] = appt;
	if (panel) {
		state.editorPanel = payload.id;
	}
};
