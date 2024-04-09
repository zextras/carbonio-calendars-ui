/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { addBoard, replaceHistory } from '@zextras/carbonio-shell-ui';
import { find, lowerCase, omit } from 'lodash';

import { generateEditor } from '../commons/editor-generator';
import { getIdentityItems } from '../commons/get-identity-items';
import { CALENDAR_ROUTE, PANEL_VIEW } from '../constants';
import { normalizeInvite } from '../normalizations/normalize-invite';
import { getInvite } from '../store/actions/get-invite';
import { sendInviteResponse } from '../store/actions/send-invite-response';
import { StoreProvider } from '../store/redux';
import { ActionsClick, ActionsContext } from '../types/actions';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { getInstanceExceptionId } from '../utils/event';
import { DeleteEventModal } from '../view/modals/delete-event-modal';
import { DeletePermanently } from '../view/modals/delete-permanently';
import { MoveApptModal } from '../view/move/move-appt-view';

export const createCopy =
	({
		event,
		invite: _invite,
		context
	}: {
		event: EventType;
		invite?: Invite;
		context: Omit<ActionsContext, 'createAndApplyTag' | 'createModal' | 'createSnackbar' | 'tags'>;
	}): ((e?: ActionsClick) => void) =>
	(): void => {
		const copy = (invite: Invite): void => {
			const eventToCopy = { ...event, resource: omit(event.resource, 'id') } as EventType;
			context?.onClose && context?.onClose();
			const identities = getIdentityItems();
			const organizer = find(identities, ['identityName', 'DEFAULT']);
			const isSeries = event?.resource?.isRecurrent && !event?.resource?.ridZ;
			const isInstance = !event?.resource?.isRecurrent && !!event?.resource?.ridZ;
			const editor = generateEditor({
				event: eventToCopy,
				invite,
				context: {
					folders: context.folders,
					dispatch: context.dispatch,
					panel: context.panel ?? true,
					organizer,
					recur: isSeries ? invite.recurrenceRule : undefined,
					exceptId: undefined,
					isInstance,
					isSeries,
					isException: false
				}
			});
			addBoard({
				url: `${CALENDAR_ROUTE}/`,
				title: editor?.title ?? '',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				editor
			});
		};
		if (!_invite) {
			context
				.dispatch(getInvite({ inviteId: event?.resource?.inviteId, ridZ: event?.resource?.ridZ }))
				.then((res) => {
					if (res.payload) {
						const invite = normalizeInvite(res.payload.m[0]);
						copy(invite);
					}
				});
		} else {
			copy(_invite);
		}
	};

export const editAppointment =
	({
		event,
		invite: _invite,
		context
	}: {
		event: EventType;
		invite?: Invite;
		context: Omit<ActionsContext, 'createAndApplyTag' | 'createModal' | 'createSnackbar' | 'tags'>;
	}): ((e?: ActionsClick) => void) =>
	(): void => {
		const edit = (invite: Invite): void => {
			const editor = generateEditor({
				event,
				invite,
				context: {
					panel: false,
					dispatch: context.dispatch,
					folders: context.folders
				}
			});
			addBoard({
				url: `${CALENDAR_ROUTE}/`,
				title: editor?.title ?? '',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				editor
			});
		};
		if (!_invite) {
			context
				.dispatch(getInvite({ inviteId: event?.resource?.inviteId, ridZ: event?.resource?.ridZ }))
				.then((res) => {
					if (res.payload) {
						const invite = normalizeInvite(res.payload.m[0]);
						edit(invite);
					}
				});
		} else {
			edit(_invite);
		}
	};

export const moveAppointment =
	({
		event,
		context
	}: {
		event: EventType;
		context: ActionsContext;
	}): ((e: ActionsClick) => void) =>
	(ev?: ActionsClick): void => {
		if (ev) ev.preventDefault();

		context?.onClose && context?.onClose();
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

export const deletePermanently =
	({
		event,
		context
	}: {
		event: EventType;
		context: ActionsContext;
	}): ((e: ActionsClick) => void) =>
	(ev?: ActionsClick): void => {
		if (ev) ev.preventDefault();
		context?.onClose && context?.onClose();
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
		invite: _invite,
		context
	}: {
		event: EventType;
		invite?: Invite;
		context: ActionsContext;
	}): ((e: ActionsClick) => void) =>
	(): void => {
		const trashEvent = (invite: Invite): void => {
			context?.onClose && context?.onClose();
			const closeModal = context.createModal(
				{
					children: (
						<StoreProvider>
							<DeleteEventModal event={event} invite={invite} onClose={(): void => closeModal()} />
						</StoreProvider>
					),
					onClose: () => {
						closeModal();
					}
				},
				true
			);
		};
		if (!_invite) {
			context
				.dispatch(getInvite({ inviteId: event?.resource?.inviteId, ridZ: event?.resource?.ridZ }))
				.then((res) => {
					if (res.payload) {
						const invite = normalizeInvite(res.payload.m[0]);
						trashEvent(invite);
					}
				});
		} else {
			trashEvent(_invite);
		}
	};

export const openAppointment =
	({
		event,
		context
	}: {
		event: EventType;
		context: ActionsContext;
	}): ((e: ActionsClick) => void) =>
	(): void => {
		context?.onClose && context?.onClose();
		if (context?.panelView === PANEL_VIEW.APP) {
			const path = event.resource.ridZ
				? `/${event.resource.calendar.id}/${EventActionsEnum.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
				: `/${event.resource.calendar.id}/${EventActionsEnum.EXPAND}/${event.resource.id}`;
			replaceHistory(path);
		}
		if (context?.panelView === PANEL_VIEW.SEARCH) {
			const path = event.resource.ridZ
				? `/${EventActionsEnum.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
				: `/${EventActionsEnum.EXPAND}/${event.resource.id}`;
			replaceHistory(path);
		}
	};
export const acceptInvitation =
	({
		event,
		invite,
		context
	}: {
		event: EventType;
		invite?: Invite;
		context: Omit<ActionsContext, 'createAndApplyTag' | 'createModal' | 'createSnackbar' | 'tags'>;
	}): ((e: ActionsClick) => void) =>
	(): void => {
		const exceptId =
			context.isInstance || event.resource.isException
				? getInstanceExceptionId({
						start: event.start,
						allDay: event.allDay,
						tz: invite?.tz
					})
				: undefined;

		context.dispatch(
			sendInviteResponse({
				inviteId: event.resource.inviteId,
				exceptId,
				updateOrganizer: true,
				action: 'ACCEPT'
			})
		);
	};

export const declineInvitation =
	({
		event,
		invite,
		context
	}: {
		event: EventType;
		invite?: Invite;
		context: Omit<ActionsContext, 'createAndApplyTag' | 'createModal' | 'createSnackbar' | 'tags'>;
	}): ((e: ActionsClick) => void) =>
	(): void => {
		const exceptId =
			context.isInstance || event.resource.isException
				? getInstanceExceptionId({
						start: event.start,
						allDay: event.allDay,
						tz: invite?.tz
					})
				: undefined;
		context.dispatch(
			sendInviteResponse({
				inviteId: event.resource.inviteId,
				exceptId,
				updateOrganizer: true,
				action: 'DECLINE'
			})
		);
	};

export const acceptAsTentative =
	({
		event,
		invite,
		context
	}: {
		event: EventType;
		invite?: Invite;
		context: Omit<ActionsContext, 'createAndApplyTag' | 'createModal' | 'createSnackbar' | 'tags'>;
	}): ((e: ActionsClick) => void) =>
	(): void => {
		const exceptId =
			context.isInstance || event.resource.isException
				? getInstanceExceptionId({
						start: event.start,
						allDay: event.allDay,
						tz: invite?.tz
					})
				: undefined;
		context.dispatch(
			sendInviteResponse({
				inviteId: event.resource.inviteId,
				exceptId,
				updateOrganizer: true,
				action: 'TENTATIVE'
			})
		);
	};

export const proposeNewTimeFn =
	({
		event,
		invite: _invite,
		context
	}: {
		event: EventType;
		invite?: Invite;
		context: Omit<ActionsContext, 'createAndApplyTag' | 'createModal' | 'createSnackbar' | 'tags'>;
	}): ((e?: ActionsClick) => void) =>
	(): void => {
		const proposeTime = (invite: Invite): void => {
			const editor = generateEditor({
				event,
				invite,
				context: {
					panel: false,
					dispatch: context.dispatch,
					folders: context.folders,
					isProposeNewTime: true,
					attendees: [
						{
							email: event?.resource?.organizer?.email ?? event?.resource?.organizer?.email,
							id: event?.resource?.organizer?.email ?? event?.resource?.organizer?.email
						}
					],
					disabled: {
						title: true,
						location: true,
						organizer: true,
						virtualRoom: true,
						richTextButton: true,
						attachmentsButton: true,
						saveButton: true,
						attendees: true,
						optionalAttendees: true,
						freeBusy: true,
						calendar: true,
						private: true,
						allDay: true,
						reminder: true,
						recurrence: true,
						meetingRoom: true,
						equipment: true,
						timezone: true
					}
				}
			});
			addBoard({
				url: `${CALENDAR_ROUTE}/`,
				title: editor?.title ?? '',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				editor
			});
		};
		if (!_invite) {
			context
				.dispatch(getInvite({ inviteId: event?.resource?.inviteId, ridZ: event?.resource?.ridZ }))
				.then((res) => {
					if (res.payload) {
						const invite = normalizeInvite(res.payload.m[0]);
						proposeTime(invite);
					}
				});
		} else {
			proposeTime(_invite);
		}
	};

export const exportAppointmentICSFn =
	({ event }: { event: EventType }): ((e?: ActionsClick) => void) =>
	(): void => {
		const downloadICS = (name: string, uri: string): void => {
			const link = document.createElement('a');
			link.download = name;
			link.href = uri;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		};
		downloadICS(
			`${lowerCase(event?.title)}.ics`,
			`/service/home/~/?auth=co&id=${event.resource.id}&mime=text/plain&noAttach=1&icalAttach=none`
		);
	};
