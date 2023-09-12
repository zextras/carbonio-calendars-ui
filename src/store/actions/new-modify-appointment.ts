/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';
import moment from 'moment';

import { generateSoapMessageFromEditor } from './new-create-appointment';
import {
	findAttachments,
	retrieveAttachmentsType
} from '../../normalizations/normalizations-utils';
import { Editor } from '../../types/editor';

// todo: this thunk is not using redux! convert to regular async function
export const modifyAppointment = createAsyncThunk(
	'appointment/modify appointment',
	async (
		{ draft, editor }: { draft: boolean; editor: Editor },
		{ rejectWithValue }: any
	): Promise<any> => {
		if (editor) {
			if (editor.isSeries && editor.isInstance && !editor.isException) {
				const exceptId = omitBy(
					editor.allDay
						? {
								d: moment(editor.ridZ).format('YYYYMMDD'),
								tz: editor.timezone
						  }
						: {
								d: editor.timezone
									? moment(editor.ridZ).format('YYYYMMDD[T]HHmmss')
									: moment(editor.ridZ).utc().format('YYYYMMDD[T]HHmmss[Z]'),
								tz: editor.timezone
						  },
					isNil
				);
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const body = generateSoapMessageFromEditor({ ...editor, draft, exceptId });
				const res: { calItemId: string; invId: string } = await soapFetch(
					'CreateAppointmentException',
					body
				);
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const response = res?.Fault ? { ...res.Fault, error: true } : res;
				if (response?.error) {
					return rejectWithValue(response);
				}
				const updatedEditor = {
					...editor,
					isSeries: false,
					isInstance: true,
					isException: true,
					isNew: false,
					inviteId: response.invId,
					exceptId
				};
				return { response, editor: updatedEditor };
			}
			const body = generateSoapMessageFromEditor({ ...editor, draft });
			const res: { calItemId: string; echo: any } = await soapFetch('ModifyAppointment', body);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const response = res?.Fault ? { ...res.Fault, error: true } : res;
			if (response?.error) {
				return rejectWithValue(response);
			}
			const attach = {
				mp: retrieveAttachmentsType(
					res?.echo?.[0]?.m?.[0]?.mp?.[0] ?? [],
					'attachment',
					res?.echo?.[0]?.m?.[0]?.id
				)
			};
			const attachmentFiles = findAttachments(res?.echo?.[0]?.m?.[0]?.mp ?? [], []);
			const updatedEditor = {
				...editor,
				isSeries: !!editor.recur,
				isInstance: !editor.recur,
				isNew: false,
				attach,
				attachmentFiles
			};
			return { response: res, editor: updatedEditor };
		}
		return undefined;
	}
);
