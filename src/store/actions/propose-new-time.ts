/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { counterAppointmentRequest } from '../../soap/counter-appointment-request';

/* todo: currently not used. To deprecate in favour of the new editor structure  */

export const proposeNewTime = createAsyncThunk(
	'calendars/proposeNewTime',
	async ({ id }: { id: string }, { getState }): Promise<any> => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const appt = getState().editor.editors[id];
		return counterAppointmentRequest({ appt });
	}
);
