/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { addBoard, getAction } from '@zextras/carbonio-shell-ui';
import { LinkFolder } from '@zextras/carbonio-ui-commons';
import { filter, find, keyBy, lowerCase, omit } from 'lodash';

import { generateEditor } from '../commons/editor-generator';
import { getIdentityItems } from '../commons/get-identity-items';
import { CALENDAR_BOARD_ID, CALENDAR_ROUTE, PANEL_VIEW } from '../constants';
import { EVENT_ACTIONS } from '../constants/event-actions';
import { normalizeInvite } from '../normalizations/normalize-invite';
import { getInvite } from '../store/actions/get-invite';
import { sendInviteResponse } from '../store/actions/send-invite-response';
import { StoreProvider } from '../store/redux';
import { ActionsClick, ActionsContext } from '../types/actions';
import { EventType } from '../types/event';
import { Attendee, Invite } from '../types/store/invite';
import { getInstanceExceptionId } from '../utils/event';
import { DeleteEventModal } from '../view/modals/delete-event-modal';
import { DeletePermanently } from '../view/modals/delete-permanently';
import { MoveApptModal } from '../view/move/move-appt-view';
import { InviteReplyVerb } from 'soap/send-invite-reply-request';

type ActionsContextIgnored =
	| 'createAndApplyTag'
	| 'createModal'
	| 'closeModal'
	| 'createSnackbar'
	| 'tags';

type Recipient = {
	email: string;
	name: string;
	carbonCopy: boolean;
};

function getRecipientFromOrganizer(organizer: EventType['resource']['organizer']): Recipient {
	return {
		email: organizer?.email ?? '',
		name: organizer?.name ?? '',
		carbonCopy: false
	};
}

function getRecipientFromAttendee(attendee: Attendee): Recipient {
	return {
		email: attendee.a,
		name: attendee.d,
		carbonCopy: attendee.role === 'OPT'
	};
}

export const emailAttendees = (
	{
		event,
		invite: _invite,
		context
	}: {
		event: EventType;
		invite?: Invite;
		context: Omit<ActionsContext, ActionsContextIgnored>;
	},
	e?: ActionsClick
): void => {
	const identities = getIdentityItems().map((identity) => identity.address ?? '');
	const sendMail = (invite: Invite, mySelf: Array<string>): void => {
		const recipients = [
			...invite.attendees.map(getRecipientFromAttendee),
			getRecipientFromOrganizer(event.resource.organizer)
		].filter((attendee) => !mySelf.includes(attendee.email));
		const [mailTo, available] = getAction('recipients', 'mail-to', {
			recipients,
			subject: event.title
		});
		if (!available || !mailTo) {
			return;
		}
		const { execute } = mailTo;
		execute(e);
	};
	if (!_invite) {
		context
			.dispatch(getInvite({ inviteId: event?.resource?.inviteId, ridZ: event?.resource?.ridZ }))
			.then((res) => {
				if (res.payload) {
					const invite = normalizeInvite(res.payload.m[0]);
					return sendMail(invite, identities);
				}
				return undefined;
			});
	} else {
		sendMail(_invite, identities);
	}
};

export const createCopy =
	({
		event,
		invite: _invite,
		context
	}: {
		event: EventType;
		invite?: Invite;
		context: Omit<ActionsContext, ActionsContextIgnored>;
	}): (() => void) =>
	(): void => {
		const copy = (invite: Invite): void => {
			const eventToCopy = { ...event, resource: omit(event.resource, 'id') } as EventType;
			context?.onClose?.();
			const identities = getIdentityItems();
			const organizer = find(identities, ['identityName', 'DEFAULT']);
			const isSeries = event?.resource?.isRecurrent && !event?.resource?.ridZ;
			const isInstance = !event?.resource?.isRecurrent && !!event?.resource?.ridZ;
			const availableFolders = keyBy(
				filter(context.folders, (calendar) =>
					calendar.perm ? /w/.test(calendar.perm) : !(calendar as LinkFolder).owner
				),
				'id'
			);
			const editor = generateEditor({
				event: eventToCopy,
				invite,
				context: {
					folders: availableFolders,
					dispatch: context.dispatch,
					panel: context.panel ?? true,
					organizer: { email: organizer?.address ?? '', fullName: organizer?.fullName ?? '' },
					recur: isSeries ? invite.recurrenceRule : undefined,
					exceptId: undefined,
					isInstance,
					isSeries,
					isException: false
				}
			});
			addBoard({
				boardViewId: CALENDAR_BOARD_ID,
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
		context: Omit<ActionsContext, ActionsContextIgnored>;
	}): (() => void) =>
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
				boardViewId: CALENDAR_BOARD_ID,
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

		context?.onClose?.();
		const modalId = 'move-appointment';
		context.createModal(
			{
				id: modalId,
				maxHeight: '90vh',
				children: (
					<StoreProvider>
						<MoveApptModal event={event} onClose={(): void => context.closeModal(modalId)} />
					</StoreProvider>
				),
				onClose: () => {
					context.closeModal(modalId);
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
		context?.onClose?.();
		const modalId = 'delete-permanently';
		context.createModal(
			{
				id: modalId,
				children: (
					<StoreProvider>
						<DeletePermanently onClose={(): void => context.closeModal(modalId)} event={event} />
					</StoreProvider>
				),
				onClose: () => {
					context.closeModal(modalId);
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
	}): (() => void) =>
	(): void => {
		const trashEvent = (invite: Invite): void => {
			context?.onClose?.();
			const modalId = 'move-to-trash';
			context.createModal(
				{
					id: modalId,
					children: (
						<StoreProvider>
							<DeleteEventModal
								event={event}
								invite={invite}
								onClose={(): void => context.closeModal(modalId)}
							/>
						</StoreProvider>
					),
					onClose: () => {
						context.closeModal(modalId);
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
	({ event, context }: { event: EventType; context: ActionsContext }): (() => void) =>
	(): void => {
		context?.onClose?.();
		if (context?.panelView === PANEL_VIEW.APP) {
			const path = event.resource.ridZ
				? `/${CALENDAR_ROUTE}/${event.resource.calendar.id}/${EVENT_ACTIONS.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
				: `/${CALENDAR_ROUTE}/${event.resource.calendar.id}/${EVENT_ACTIONS.EXPAND}/${event.resource.id}`;
			context.replaceHistory(path);
		}
		if (context?.panelView === PANEL_VIEW.SEARCH) {
			const path = event.resource.ridZ
				? `../${EVENT_ACTIONS.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
				: `../${CALENDAR_ROUTE}/${EVENT_ACTIONS.EXPAND}/${event.resource.id}`;
			context.replaceHistory(path);
		}
	};

export const acceptAsAction =
	({
		actionType,
		event,
		invite,
		context
	}: {
		actionType: InviteReplyVerb;
		event: EventType;
		invite?: Invite;
		context: Omit<ActionsContext, ActionsContextIgnored>;
	}): (() => void) =>
	(): void => {
		const exceptId =
			event.resource.isRecurrent && (context.isInstance || event.resource.isException)
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
				action: actionType
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
		context: Omit<ActionsContext, ActionsContextIgnored>;
	}): (() => void) =>
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
							email: event?.resource?.organizer?.email ?? event?.resource?.organizer?.email ?? ''
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
				boardViewId: CALENDAR_BOARD_ID,
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
	({ event }: { event: EventType }): (() => void) =>
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
