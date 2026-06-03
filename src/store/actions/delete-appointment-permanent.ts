/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';

import { publishQuotaChangedEvent } from '../../event-bus/quota-changed';
import {
	ItemActionRejectedType,
	itemActionRequest,
	ItemActionReturnType
} from '../../soap/item-action-request';
import { Invite } from '../../types/store/invite';
import { AppointmentsSlice } from '../../types/store/store';
import { getInviteAttachmentsSize } from '../../utils/attachments-size';

type InvitesState = { invites: { invites: Record<string, Invite> } };

export type DeleteAppointmentArguments = {
	id: string;
	previousState?: AppointmentsSlice['appointments'];
};

export type DeleteAppointmentReturnType = {
	response: ItemActionReturnType;
	id: string;
};

export const deleteAppointmentPermanent = createAsyncThunk<
	DeleteAppointmentReturnType,
	DeleteAppointmentArguments,
	{
		rejectValue: ItemActionRejectedType;
		state: InvitesState;
	}
>('appointments/deleteAppointmentPermanent', async ({ id }, { getState, rejectWithValue }) => {
	const response = await itemActionRequest({ id, op: 'delete' });
	if (response?.error) {
		return rejectWithValue(response);
	}
	const invite = getState().invites.invites[id];
	publishQuotaChangedEvent(getInviteAttachmentsSize(invite));
	return { response, id };
});
