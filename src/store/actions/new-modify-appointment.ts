/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getUserAccount, getUserSettings, soapFetch } from '@zextras/carbonio-shell-ui';
import { isNil, omitBy } from 'lodash';
import moment from 'moment';
import {
	findAttachments,
	retrieveAttachmentsType
} from '../../normalizations/normalizations-utils';
import { Invite } from '../../types/store/invite';
import { generateSoapMessageFromEditor } from './new-create-appointment';

export const generateSoapMessageFromInvite = (invite: Invite): any => {
	const at = [];
	invite.attendees && at.push(...invite.attendees);

	const e = at
		.map((attendee) => ({
			a: attendee.a,
			p: attendee.d,
			t: 't'
		}))
		.concat({
			a: invite.organizer.a,
			p: invite.organizer.d,
			t: 'f'
		});

	return {
		id: invite.id,
		comp: '0',
		m: {
			attach: invite.attach,
			su: invite.name,
			l: invite.parent,
			e,
			inv: {
				comp: [
					{
						alarm: invite.alarmData,
						at: invite.attendees,
						allDay: invite.allDay ? '1' : '0',
						fb: invite.freeBusy,
						loc: invite.location,
						name: invite.name,
						or: {
							a: invite.organizer.a,
							d: invite.organizer.d || invite.organizer.url
						},
						recur: invite.recurrenceRule ?? null,
						status: invite.status,
						transp: invite.transparency,
						s: invite?.start,
						e: invite?.end,
						class: invite.class,
						draft: invite.draft ?? 0
					}
				],
				uid: invite.uid
			},
			mp: {
				ct: 'multipart/alternative',
				mp: [
					{
						ct: 'text/plain',
						content: invite?.textDescription?.[0]?._content ?? ''
					}
				]
			}
		},
		ms: invite.ms,
		rev: invite.rev,
		_jsns: 'urn:zimbraMail'
	};
};

export const modifyAppointment = createAsyncThunk(
	'appointment/modify appointment',
	async ({ id, draft }: any, { getState }: any): Promise<any> => {
		const editor = getState()?.editor?.editors?.[id];
		const { zimbraPrefUseTimeZoneListInCalendar } = getUserSettings().prefs;

		if (editor) {
			if (editor.isSeries && editor.isInstance && !editor.isException) {
				const exceptId = omitBy(
					{
						d:
							editor?.timezone && zimbraPrefUseTimeZoneListInCalendar === 'TRUE'
								? moment(editor.ridZ).format('YYYYMMDD[T]HHmmss')
								: moment(editor.ridZ).utc().format('YYYYMMDD[T]HHmmss[Z]'),
						tz:
							editor?.timezone && zimbraPrefUseTimeZoneListInCalendar === 'TRUE'
								? editor?.timezone
								: undefined
					},
					isNil
				);
				const body = generateSoapMessageFromEditor({ ...editor, draft, exceptId });
				const res: { calItemId: string; invId: string } = await soapFetch(
					'CreateAppointmentException',
					body
				);
				const updatedEditor = {
					...editor,
					isSeries: true,
					isInstance: true,
					isException: true,
					isNew: false,
					inviteId: res.invId,
					exceptId
				};
				return { response: res, editor: updatedEditor };
			}
			const body = generateSoapMessageFromEditor({ ...editor, draft });
			const res: { calItemId: string; echo: any } = await soapFetch('ModifyAppointment', body);
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
