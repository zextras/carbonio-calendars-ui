/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { TFunction } from 'i18next';
import { lowerCase } from 'lodash';

import {
	CancelAppointmentRejectedType,
	cancelAppointmentRequest,
	CancelAppointmentReturnType
} from '../../soap/cancel-appointment-request';
import { AppointmentsSlice } from '../../types/store/store';
import { getAppointmentDurationString } from '../../utils/get-appointment-duration-string';
import type { RootState } from '../redux';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getMp({ t, fullInvite, newMessage, deleteSingleInstance }: any) {
	const meetingCanceled =
		newMessage ?? `${t('message.meeting_canceled', 'The following meeting has been cancelled')}:`;

	const originalInviteTitle = t('message.original_invite', `-----Original Invite-----`);

	const originalInviteContentPlain = fullInvite?.textDescription?.[0]?._content ?? '';

	const originalInviteContentHtml = fullInvite?.htmlDescription?.[0]?._content?.slice?.(6) ?? '';

	const date = getAppointmentDurationString(
		t,
		fullInvite.start.u ?? 0,
		fullInvite.end.u ?? 0,
		fullInvite.allDay ?? false
	);
	const instance =
		!fullInvite.recurrenceRule || deleteSingleInstance
			? t('label.instance', 'instance')
			: t('label.series', 'series');

	const instanceData = `"${fullInvite?.name ?? ''}" ${lowerCase(instance)}, ${date}`;

	const mp = {
		ct: 'multipart/alternative',
		mp: [
			{
				ct: 'text/plain',
				content: `${meetingCanceled}\n\n${instanceData}\n\n${originalInviteTitle}\n\n${originalInviteContentPlain}`
			}
		]
	};
	if (fullInvite.htmlDescription) {
		mp.mp.push({
			ct: 'text/html',
			content: `<html><h3>${meetingCanceled}</h3>${instanceData}<br/><br/>${originalInviteTitle}<br/><br/>${originalInviteContentHtml}`
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
	const participants = invite.neverSent
		? organizer
		: getParticipants(Object.entries(invite?.participants).flatMap(([_, value]) => value)).concat(
				organizer
			) ?? organizer;
	return {
		e: participants,
		su: `${t('label.cancelled', 'Cancelled')}: ${invite?.name ?? ''}`,
		mp: getMp({ t, fullInvite: invite, newMessage })
	};
}

export type MoveAppointmentToTrashArguments = {
	inviteId: string;
	t: TFunction;
	isOrganizer: boolean;
	deleteSingleInstance: boolean;
	inst: any;
	s: any;
	inv?: any;
	newMessage: any;
	ridZ: any;
	recur: boolean;
	isRecurrent: boolean;
	id: string;
	previousState?: AppointmentsSlice['appointments'];
};

export type MoveAppointmentToTrashReturnType = {
	response: CancelAppointmentReturnType;
	inviteId: string;
};

export const moveAppointmentToTrash = createAsyncThunk<
	MoveAppointmentToTrashReturnType,
	MoveAppointmentToTrashArguments,
	{
		state: RootState;
		rejectValue: CancelAppointmentRejectedType;
	}
>(
	'appointments/moveAppointmentToTrash',
	async (
		{ inviteId, t, isOrganizer = true, deleteSingleInstance = false, inst, s, inv, newMessage },
		{ getState, rejectWithValue }
	) => {
		const state = getState();
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
		if (response?.error) {
			return rejectWithValue(response);
		}
		return { response, inviteId };
	}
);
