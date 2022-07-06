/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { DeletePermanently } from '../commons/delete-permanently';
import { generateEditor } from '../commons/editor-generator';
import { normalizeEditorFromInvite } from '../normalizations/normalize-editor';
import { sendInviteResponse } from '../store/actions/send-invite-response';
import { updateParticipationStatus } from '../store/slices/appointments-slice';
import { ActionsContext } from '../types/actions';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { DeleteEventModal } from '../view/delete/delete-event-modal';
import { MoveApptModal } from '../view/move/move-appt-view';

export const openAppointment =
	({ event, context }: { event: EventType; context: ActionsContext }): ((ev: Event) => void) =>
	(ev: Event): void => {
		if (ev) ev.stopPropagation();
		const path = `/${event.resource.calendar.id}/${EventActionsEnum.EXPAND}/${event.resource.id}/${event.resource.ridZ}`;
		context.replaceHistory(path);
	};

export const editAppointment =
	({
		event,
		invite,
		context
	}: {
		event: EventType;
		invite: Invite;
		context: ActionsContext;
	}): ((ev: Event) => void) =>
	(ev: Event): void => {
		if (ev) ev.stopPropagation();
		const editorData = normalizeEditorFromInvite(invite, {
			...context,
			calendar: event.resource.calendar
		});
		generateEditor(event.resource.id, editorData, context?.panel);
		context.replaceHistory(
			`/${event.resource.calendar.id}/${EventActionsEnum.EDIT}/${event.resource.id}/${event.resource.ridZ}`
		);
	};

export const acceptInvitation =
	({ event, context }: { event: EventType; context: ActionsContext }): ((ev: Event) => void) =>
	(ev: Event): void => {
		if (ev) ev.stopPropagation();
		context
			.dispatch(
				sendInviteResponse({
					inviteId: event.resource.inviteId,
					updateOrganizer: false,
					action: 'ACCEPT',
					compNum: event.resource.compNum
				})
			)
			.then(() =>
				context.dispatch(updateParticipationStatus({ apptId: event.resource.id, status: 'AC' }))
			);
	};

export const declineInvitation =
	({ event, context }: { event: EventType; context: ActionsContext }): ((ev: Event) => void) =>
	(ev: Event): void => {
		if (ev) ev.stopPropagation();
		context
			.dispatch(
				sendInviteResponse({
					inviteId: event.resource.inviteId,
					updateOrganizer: false,
					action: 'DECLINE',
					compNum: event.resource.compNum
				})
			)
			.then(() =>
				context.dispatch(updateParticipationStatus({ apptId: event.resource.id, status: 'DE' }))
			);
	};

export const acceptAsTentative =
	({ event, context }: { event: EventType; context: ActionsContext }): ((ev: Event) => void) =>
	(ev: Event): void => {
		if (ev) ev.stopPropagation();
		context
			.dispatch(
				sendInviteResponse({
					inviteId: event.resource.inviteId,
					updateOrganizer: false,
					action: 'TENTATIVE',
					compNum: event.resource.compNum
				})
			)
			.then(() =>
				context.dispatch(updateParticipationStatus({ apptId: event.resource.id, status: 'AC' }))
			);
	};

export const deletePermanently =
	({ event, context }: { event: EventType; context: ActionsContext }): ((ev: Event) => void) =>
	(ev: Event): void => {
		if (ev) ev.preventDefault();
		const closeModal = context.createModal(
			{
				children: (
					<DeletePermanently onClose={(): void => closeModal()} event={event} context={context} />
				),
				onClose: () => {
					closeModal();
				}
			},
			true
		);
	};

export const moveToTrash =
	({
		event,
		invite,
		context
	}: {
		event: EventType;
		invite: Invite;
		context: ActionsContext;
	}): ((ev: Event) => void) =>
	(ev: Event): void => {
		if (ev) ev.stopPropagation();
		const closeModal = context.createModal(
			{
				children: (
					<DeleteEventModal
						event={event}
						invite={invite}
						onClose={(): void => closeModal()}
						isInstance={context?.isInstance}
					/>
				),
				onClose: () => {
					closeModal();
				}
			},
			true
		);
	};

export const moveAppointment =
	({ invite, context }: { invite: Invite; context: ActionsContext }): ((ev: Event) => void) =>
	(ev: Event): void => {
		if (ev) ev.preventDefault();

		const closeModal = context.createModal(
			{
				maxHeight: '90vh',
				children: <MoveApptModal invite={invite} onClose={(): void => closeModal()} />,
				onClose: () => {
					closeModal();
				}
			},
			true
		);
	};
