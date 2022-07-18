/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createAppointmentFulfilled = (state: any, { payload }: any): void => {
	if (state?.editors?.[payload?.editor?.id]) {
		state.editors[payload.editor.id] = {
			...state.editors[payload.editor.id],
			id: payload.response.calItemId,
			inviteId: payload.response.invId
		};
	}
};
