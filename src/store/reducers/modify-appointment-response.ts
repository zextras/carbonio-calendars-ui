/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PayloadAction } from '@reduxjs/toolkit';

import { FulfilledResponse, InvitesSlice } from '../../types/store/store';
import {
	ModifyAppointmentArguments,
	ModifyAppointmentReturnType
} from '../actions/new-modify-appointment';

export const modifyAppointmentFullfilled = (
	state: InvitesSlice,
	{
		payload
	}: PayloadAction<
		ModifyAppointmentReturnType,
		string,
		FulfilledResponse<ModifyAppointmentArguments>
	>
): void => {
	if (payload?.editor?.inviteId) {
		delete state.invites[payload?.editor?.inviteId];
	}
};
