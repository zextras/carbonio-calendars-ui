/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { cancelAppointmentRequest } from '../../soap/cancel-appointment-request';
import type { RootState } from '../redux';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getMp({ t, fullInvite, newMessage }: any) {
	const meetingCanceled =
		newMessage || `${t('message.meeting_canceled', 'The following meeting has been cancelled')}:`;

	const mp = {
		ct: 'multipart/alternative',
		mp: [
			{
				ct: 'text/plain',
				content: `${meetingCanceled}\n\n${
					fullInvite.textDescription ? fullInvite.textDescription[0]._content : ''
				}`
			}
		]
	};
	if (fullInvite.htmlDescription) {
		mp.mp.push({
			ct: 'text/html',
			content: `<html><h3>${meetingCanceled}</h3><br/><br/>${fullInvite.htmlDescription[0]._content.slice(
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
	const organizer = [
		{
			a: invite?.organizer?.a,
			p: invite?.organizer?.d,
			t: 'f'
		}
	];
	return {
		e:
			getParticipants(Object.entries(invite?.participants).flatMap(([_, value]) => value)).concat(
				organizer
			) ?? organizer,
		su: `${t('label.cancelled', 'Cancelled')}: ${invite?.name ?? ''}`,
		mp: getMp({ t, fullInvite: invite, newMessage })
	};
}

export type MoveAppointmentToTrashArguments = any;
export type MoveAppointmentToTrashReturnType =
	| { response: any; inviteId: string }
	| undefined
	| unknown;

export const moveAppointmentToTrash = createAsyncThunk<
	MoveAppointmentToTrashReturnType,
	MoveAppointmentToTrashArguments,
	{
		state: RootState;
	}
>(
	'appointments/moveAppointmentToTrash',
	async (
		{
			inviteId,
			t,
			isOrganizer = true,
			deleteSingleInstance = false,
			inst,
			s,
			inv,
			newMessage
		}: MoveAppointmentToTrashArguments,
		thunkApi
	) => {
		const state = thunkApi.getState();
		const invite = inv ?? state.invites.invites[inviteId];
		const m = createMessageForDelete({ invite, t, newMessage });
		const response = await cancelAppointmentRequest({
			deleteSingleInstance,
			id: inviteId,
			inst,
			s,
			m,
			isOrganizer
		});
		return { response, inviteId };
	}
);
