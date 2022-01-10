/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handleUpdateParticipationStatus = (state: any, { payload }: any): any => {
	const { status, apptId } = payload;
	state.appointments[apptId] = {
		...state.appointments[apptId],
		ptst: status
	};
};
