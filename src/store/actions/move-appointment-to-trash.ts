/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getMp({ t, fullInvite, newMessage }: any) {
	const meetingCanceled =
		newMessage || `${t('message.meeting_canceled', 'The following meeting has been cancelled')}:`;

	const mp = {
		ct: 'multipart/alternative',
		mp: [
			{
				ct: 'text/plain',
				content: `${meetingCanceled}\n\n${fullInvite.desc ? fullInvite.desc[0]._content : ''}`
			}
		]
	};
	if (fullInvite.descHtml) {
		mp.mp.push({
			ct: 'text/html',
			content: `<html><h3>${meetingCanceled}</h3><br/><br/>${fullInvite.descHtml[0]._content.slice(
				6
			)}`
		});
	}
	return mp;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getParticipants(participants: any) {
	return participants.map((p: { email: any; name: any }) => ({
		a: p.email,
		p: p.name,
		t: 't'
	}));
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createMessageForDelete({ invite, t, newMessage }: any) {
	return {
		e: getParticipants(Object.entries(invite?.participants ?? []).flatMap(([_, value]) => value)),
		su: `${t('label.cancelled', 'Cancelled')}: ${invite?.name ?? ''}`,
		mp: getMp({ t, fullInvite: invite, newMessage })
	};
}

export const moveAppointmentToTrash = createAsyncThunk(
	'appointments/moveAppointmentToTrash',
	async (
		{
			inviteId,
			ridZ,
			t,
			isOrganizer = true,
			deleteSingleInstance = false,
			inst,
			s,
			inv,
			newMessage
		}: any,
		{ getState }
	) => {
		const state: any = getState();
		const invite = inv ?? state.invites.invites[inviteId];
		const m = createMessageForDelete({ invite, t, newMessage });
		if (deleteSingleInstance) {
			const response = await soapFetch('CancelAppointment', {
				_jsns: 'urn:zimbraMail',
				inst,
				id: inviteId,
				comp: '0',
				s,
				m: isOrganizer ? m : { ...m, e: [] }
			});
			return { response, inviteId };
		}
		const response = await soapFetch('CancelAppointment', {
			_jsns: 'urn:zimbraMail',
			id: inviteId,
			comp: '0',
			m: isOrganizer ? m : { ...m, e: [] }
		});
		return { response, inviteId };
	}
);
