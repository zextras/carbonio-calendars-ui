/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forEach } from 'lodash';

import { AppointmentsSlice } from '../../types/store/store';

export const handleDeletedAppointmentsReducer = (
	state: AppointmentsSlice,
	{ payload }: { payload: Array<string> }
): void => {
	forEach(payload, (id) => {
		delete state.appointments[id];
	});
};
