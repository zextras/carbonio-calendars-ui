/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AppointmentsSlice } from '../../types/store/store';

export const moveAppointmentFulfilled = (state: AppointmentsSlice): void => {
	state.status = 'completed';
};
