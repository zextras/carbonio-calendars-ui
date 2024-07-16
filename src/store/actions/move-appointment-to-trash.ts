/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { TFunction } from 'i18next';
import { compact, lowerCase } from 'lodash';

import {
	CancelAppointmentRejectedType,
	cancelAppointmentRequest,
	CancelAppointmentReturnType
} from '../../soap/cancel-appointment-request';
import { Invite } from '../../types/store/invite';
import { AppointmentsSlice } from '../../types/store/store';
import { formatAppointmentRange, parseDateFromICS } from '../../utils/dates';
import { InstanceExceptionId } from '../../utils/event';
import type { RootState } from '../redux';

type MessagePart = { ct: string; mp: { ct: string; content: string }[] };

export const buildMessagePart = ({
	t,
	fullInvite,
	newMessage,
	deleteSingleInstance = true,
	inst
}: {
	t: TFunction;
	fullInvite: Invite;
	deleteSingleInstance?: boolean;
	newMessage?: string;
	inst?: InstanceExceptionId;
}): MessagePart => {
	const meetingCanceled =
		newMessage ?? `${t('message.meeting_canceled', 'The following meeting has been cancelled')}:`;
	const allDayLabel = t('label.all_day', 'All day');
	const originalInviteTitle = t('message.original_invite', `-----Original Invite-----`);

	const originalInviteContentPlain = fullInvite?.textDescription?.[0]?._content ?? '';

	const originalInviteContentHtml = fullInvite?.htmlDescription?.[0]?._content?.slice?.(6) ?? '';
	const startAsString = inst?.d ?? fullInvite.start.d;
	const endAsString = inst?.d ?? fullInvite.end.d;

	const parsedStart = parseDateFromICS(startAsString, inst?.tz ?? fullInvite?.end?.tz).valueOf();
	const parsedEnd = parseDateFromICS(endAsString, inst?.tz ?? fullInvite?.end?.tz).valueOf();

	const dur = (fullInvite?.end?.u ?? parsedEnd) - (fullInvite?.start?.u ?? parsedStart);

	const startToFormat = startAsString ? parsedStart : fullInvite.start.u ?? 0;
	const endToFormat = endAsString && inst?.d ? parsedEnd + dur : parsedEnd ?? fullInvite.end.u ?? 0;

	const date = formatAppointmentRange({
		start: startToFormat,
		end: endToFormat,
		allDay: fullInvite.allDay ?? false,
		allDayLabel,
		timezone: inst?.tz ?? fullInvite?.tz
	});
	const instance =
		!fullInvite.recurrenceRule || deleteSingleInstance
			? t('label.instance', 'instance')
			: t('label.series', 'series');

	const instanceData = `"${fullInvite?.name ?? ''}" ${lowerCase(instance)}, ${date}`;

	const originalContentPlainSection = originalInviteContentPlain
		? `\n\n${originalInviteTitle}\n\n${originalInviteContentPlain}`
		: '';

	const originalContentHtmlSection = originalInviteContentHtml
		? `<br/><br/>${originalInviteTitle}<br/><br/>${originalInviteContentHtml}`
		: '';

	const plainMessagePart = {
		ct: 'text/plain',
		content: `${meetingCanceled}\n\n${instanceData}${originalContentPlainSection}`
	};

	const htmlMessagePart = fullInvite.htmlDescription
		? {
				ct: 'text/html',
				content: `<html><h3>${meetingCanceled}</h3>${instanceData}${originalContentHtmlSection}</html>`
			}
		: undefined;

	return {
		ct: 'multipart/alternative',
		mp: compact([plainMessagePart, htmlMessagePart])
	};
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getParticipants(participants: any) {
	return participants.map((p: { email: any; name: any }) => ({
		a: p.email,
		p: p.name,
		t: 't'
	}));
}

function createMessageForDelete({
	invite,
	t,
	newMessage,
	deleteSingleInstance,
	inst
}: {
	t: TFunction;
	invite: Invite;
	deleteSingleInstance: boolean;
	newMessage: string;
	inst: InstanceExceptionId;
}): { e: any; su: string; mp: MessagePart } {
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
		mp: buildMessagePart({ t, fullInvite: invite, newMessage, deleteSingleInstance, inst })
	};
}

export type MoveAppointmentToTrashArguments = {
	inviteId: string;
	t: TFunction;
	isOrganizer: boolean;
	deleteSingleInstance: boolean;
	inst: InstanceExceptionId;
	s: number;
	inv?: Invite;
	newMessage: string;
	ridZ: string;
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
		const m = createMessageForDelete({ invite, t, newMessage, deleteSingleInstance, inst });
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
