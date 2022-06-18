/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { startsWith } from 'lodash';
import { createAppointment } from './new-create-appointment';
import { modifyAppointment } from './new-modify-appointment';

export const saveAppointment = createAsyncThunk(
	'appointment/create new appointment',
	async ({ editorId }: any, { getState, dispatch }: any): Promise<any> => {
		const editor = getState()?.editor?.editors?.[editorId];
		if (editor) {
			if (startsWith(editor?.id, 'new')) {
				dispatch(createAppointment({ editor }));
			} else {
				dispatch(modifyAppointment({ editor }));
			}
		}
	}
);
