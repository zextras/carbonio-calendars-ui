/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { find, forEach, merge } from 'lodash';

import { normalizeAppointmentsFromNotify } from '../../normalizations/normalize-appointments';
import { AppointmentsSlice } from '../../types/store/store';

export const handleCreatedAppointmentsReducer = (
	state: AppointmentsSlice,
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	{ payload }: any
): void => {
	const norm = normalizeAppointmentsFromNotify(payload);

	forEach(norm, (appt) => {
		const old = find(state.appointments, ['id', appt.id]);
		if (old) {
			merge(old, appt);
		} else {
			merge(state.appointments, { [appt.id]: appt });
		}
	});
};
