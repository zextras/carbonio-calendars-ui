/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { normalizeSoapMessageFromEditor } from '../../normalizations/normalize-soap-message-from-editor';

// todo: this thunk is not using redux! convert to regular async function
export const createAppointment = createAsyncThunk(
	'appointment/create new appointment',
	async ({ draft, editor }: any, { rejectWithValue }: any): Promise<any> => {
		if (editor) {
			const body = normalizeSoapMessageFromEditor({ ...editor, draft });
			const res: { calItemId: string; invId: string } = await soapFetch('CreateAppointment', body);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const response = res?.Fault ? { ...res.Fault, error: true } : res;
			if (response?.error) {
				return rejectWithValue(response);
			}
			return {
				response: res,
				editor: {
					...editor,
					isNew: false,
					isSeries: !!editor.recur,
					isInstance: !editor.recur,
					isException: false,
					inviteId: res.invId
				}
			};
		}
		return undefined;
	}
);
