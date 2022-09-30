/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import React from 'react';
import { generateEditor } from '../commons/editor-generator';
import { PANEL_VIEW } from '../constants';
import { sendInviteResponse } from '../store/actions/send-invite-response';
import { StoreProvider } from '../store/redux';
import { updateParticipationStatus } from '../store/slices/appointments-slice';
import { ActionsContext, PanelView } from '../types/actions';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { DeleteEventModal } from '../view/modals/delete-event-modal';
import { DeletePermanently } from '../view/modals/delete-permanently';
import { MoveApptModal } from '../view/move/move-appt-view';

export const openAppointment =
	({ event, panelView }: { event: EventType; panelView: PanelView }): ((ev: Event) => void) =>
	(ev: Event): void => {
		if (ev) ev.stopPropagation();
		if (panelView === PANEL_VIEW.APP) {
			const path = event.resource.ridZ
				? `/${event.resource.calendar.id}/${EventActionsEnum.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
				: `/${event.resource.calendar.id}/${EventActionsEnum.EXPAND}/${event.resource.id}`;
			replaceHistory(path);
		}
		if (panelView === PANEL_VIEW.SEARCH) {
			const path = event.resource.ridZ
				? `/${EventActionsEnum.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
				: `/${EventActionsEnum.EXPAND}/${event.resource.id}`;
			replaceHistory(path);
		}
	};

export const acceptInvitation =
	({ event, context }: { event: EventType; context: ActionsContext }): ((ev: Event) => void) =>
	(ev: Event): void => {
		if (ev) ev.stopPropagation();
		context
			.dispatch(
				sendInviteResponse({
					inviteId: event.resource.inviteId,
					updateOrganizer: true,
					action: 'ACCEPT'
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
					updateOrganizer: true,
					action: 'DECLINE'
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
					updateOrganizer: true,
					action: 'TENTATIVE'
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
					<StoreProvider>
						<DeletePermanently onClose={(): void => closeModal()} event={event} context={context} />
					</StoreProvider>
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
					<StoreProvider>
						<DeleteEventModal
							event={event}
							invite={invite}
							context={context}
							onClose={(): void => closeModal()}
						/>
					</StoreProvider>
				),
				onClose: () => {
					closeModal();
				}
			},
			true
		);
	};

export const moveAppointment =
	({ event, context }: { event: EventType; context: ActionsContext }): ((ev: Event) => void) =>
	(ev: Event): void => {
		if (ev) ev.preventDefault();

		const closeModal = context.createModal(
			{
				maxHeight: '90vh',
				children: (
					<StoreProvider>
						<MoveApptModal event={event} onClose={(): void => closeModal()} />
					</StoreProvider>
				),
				onClose: () => {
					closeModal();
				}
			},
			true
		);
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
	}): ((ev: React.MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent) => void) =>
	(ev: React.MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent): void => {
		if (ev) ev.stopPropagation();
		if (context?.panelView === PANEL_VIEW.APP) {
			generateEditor({
				event,
				invite,
				context: {
					panel: context.panel ?? true
				}
			});
			const path = event.resource.ridZ
				? `/${event.resource.calendar.id}/${EventActionsEnum.EDIT}/${event.resource.id}/${event.resource.ridZ}`
				: `/${event.resource.calendar.id}/${EventActionsEnum.EDIT}/${event.resource.id}`;
			replaceHistory(path);
		}
		if (context?.panelView === PANEL_VIEW.SEARCH) {
			generateEditor({ event, invite, context: { searchPanel: true, panel: false } });
			const path = event.resource.ridZ
				? `/${EventActionsEnum.EDIT}/${event.resource.id}/${event.resource.ridZ}`
				: `/${EventActionsEnum.EDIT}/${event.resource.id}`;
			replaceHistory(path);
		}
	};
