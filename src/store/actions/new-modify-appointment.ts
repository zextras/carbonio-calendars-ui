/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import moment from 'moment';
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

/* export const modifyAppointment = createAsyncThunk(
	'appointment/modify appointment',
	async ({ invite, editor }: any): Promise<unknown> => {
		const normalizeInviteToSoap = invite
			? generateSoapMessageFromInvite(invite)
			: generateSoapMessageFromEditor(editor);
		if (editor.isInstance && !editor.isException) {
			return undefined;
			// createApptException
		}
		return soapFetch('ModifyAppointment', normalizeInviteToSoap);
	}
); */

export const modifyAppointment = createAsyncThunk(
	'appointment/create new appointment',
	async ({ id, draft }: any, { getState }: any): Promise<any> => {
		const editor = getState()?.editor?.editors?.[id];
		if (editor) {
			if (editor.isSeries && editor.isInstance && !editor.isException) {
				const exceptId = {
					d: editor?.timezone
						? moment(editor.start).format('YYYYMMDD[T]HHmmss')
						: moment(editor.start).utc().format('YYYYMMDD[T]HHmmss[Z]'),
					tz: editor?.timezone
				};
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
			const res: { calItemId: string } = await soapFetch('ModifyAppointment', body);
			const updatedEditor = { ...editor, isSeries: !!editor.recur, isNew: false };
			return { response: res, editor: updatedEditor };
		}
		return undefined;
	}
);
