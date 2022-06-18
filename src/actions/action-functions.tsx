/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS, getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import React from 'react';
import { generateEditor } from '../commons/editor-generator';
import { normalizeEditorFromInvite } from '../normalizations/normalize-editor';
import { moveAppointmentRequest } from '../store/actions/move-appointment';
import { sendInviteResponse } from '../store/actions/send-invite-response';
import { updateParticipationStatus } from '../store/slices/appointments-slice';
import { ActionsContext } from '../types/actions';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { Invite } from '../types/store/invite';
import { DeleteEventModal } from '../view/delete/delete-event-modal';
import { DeletePermanently } from '../view/modals/delete-permanently';
import { MoveApptModal } from '../view/move/move-appt-view';

export const openAppointment = (ev: Event, invite: Invite, context: ActionsContext): void => {
	if (ev) ev.stopPropagation();
	const path = context.ridZ
		? `/${invite.ciFolder}/${EventActionsEnum.EXPAND}/${invite.apptId}/${context.ridZ}`
		: `/${invite.ciFolder}/${EventActionsEnum.EXPAND}/${invite.apptId}`;
	context.replaceHistory(path);
};

export const editAppointment = (ev: Event, invite: Invite, context: ActionsContext): void => {
	if (ev) ev.stopPropagation();
	const editorData = normalizeEditorFromInvite(invite, context);
	const { editor } = generateEditor(invite.apptId, editorData);
	context.isFromSearch
		? context.replaceHistory(`/${EventActionsEnum.EDIT}/${editor.id}`)
		: context.replaceHistory(`/${invite.ciFolder}/${EventActionsEnum.EDIT}/${editor.id}`);
};

export const acceptInvitation = (ev: Event, invite: Invite, context: ActionsContext): void => {
	if (ev) ev.stopPropagation();
	context
		.dispatch(
			sendInviteResponse({
				inviteId: invite.id,
				updateOrganizer: false,
				action: 'ACCEPT',
				compNum: invite.compNum
			})
		)
		.then(() =>
			context.dispatch(updateParticipationStatus({ apptId: invite.apptId, status: 'AC' }))
		);
};

export const declineInvitation = (ev: Event, invite: Invite, context: ActionsContext): void => {
	if (ev) ev.stopPropagation();
	context
		.dispatch(
			sendInviteResponse({
				inviteId: invite.id,
				updateOrganizer: false,
				action: 'DECLINE',
				compNum: invite.compNum
			})
		)
		.then(() =>
			context.dispatch(updateParticipationStatus({ apptId: invite.apptId, status: 'DE' }))
		);
};

export const acceptAsTentative = (ev: Event, invite: Invite, context: ActionsContext): void => {
	if (ev) ev.stopPropagation();
	context
		.dispatch(
			sendInviteResponse({
				inviteId: invite.id,
				updateOrganizer: false,
				action: 'TENTATIVE',
				compNum: invite.compNum
			})
		)
		.then(() =>
			context.dispatch(updateParticipationStatus({ apptId: invite.apptId, status: 'AC' }))
		);
};

export const deletePermanently = (ev: Event, invite: Invite, context: ActionsContext): void => {
	if (ev) ev.preventDefault();
	const closeModal = context.createModal(
		{
			children: (
				<DeletePermanently onClose={(): void => closeModal()} invite={invite} context={context} />
			),
			onClose: () => {
				closeModal();
			}
		},
		true
	);
};

export const moveToTrash = (ev: Event, invite: Invite, context: ActionsContext): void => {
	if (ev) ev.stopPropagation();
	const closeModal = context.createModal(
		{
			children: (
				<DeleteEventModal
					event={invite}
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

export const moveAppointment = (ev: Event, invite: Invite, context: ActionsContext): void => {
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
