/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find, forEach, merge } from 'lodash';

import { AppointmentsSlice } from '../../types/store/store';

export const handleModifiedAppointmentsReducer = (
	state: AppointmentsSlice,
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	{ payload }: any
): void => {
	forEach(payload, (appt) => {
		const oldAppt = find(state.appointments, ['id', appt.id]);
		if (oldAppt) {
			merge(oldAppt, { l: appt.l });
		}
	});
};
