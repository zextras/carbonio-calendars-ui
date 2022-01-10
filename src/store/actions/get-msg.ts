/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/zapp-shell';
import { reduce } from 'lodash';
import { Appointment } from '../../types/store/appointments';

export const getInstances = createAsyncThunk(
	'calendars/instances/get',
	async (appts: Array<Appointment>) => {
		const ids = reduce(
			appts,
			(acc, v) => {
				reduce(
					v.inst,
					(acc2, v2) => {
						if (v2.ridZ) {
							acc2.push(v2.ridZ);
						}
						return acc2;
					},
					acc
				);
				return acc;
			},
			[] as Array<string>
		);
		const { m } = (await soapFetch('GetMsg', {
			_jsns: 'urn:zimbraMail',
			m: ids.join(',')
		})) as { m: any };
		return m;
	}
);
