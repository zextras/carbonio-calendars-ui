/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createAppointmentFulfilled = (state: any, { payload }: any): void => {
	state.editors[payload.editor.resource.id].resource.id = payload.response.calItemId;
	state.editors[payload.editor.resource.id].resource.inviteId = payload.response.invId;
};
