/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { TFunction } from 'i18next';
import { ActionsContext } from '../types/actions';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { Invite } from '../types/store/invite';
import { applyTag } from '../view/tags/tag-actions';
import {
	acceptAsTentative,
	acceptInvitation,
	declineInvitation,
	deletePermanently,
	editAppointment,
	moveAppointment,
	moveToTrash,
	openAppointment
} from './action-functions';

export const openInDisplayerItem = (
	invite: Invite,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.EXPAND,
	icon: 'ExpandOutline',
	disabled: false,
	label: t('event.action.expand', 'Open in Displayer'),
	keepOpen: true,
	click: (ev: Event): void => openAppointment(ev, invite, context)
});

export const acceptInvitationItem = (
	invite: Invite,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.ACCEPT,
	icon: 'CheckmarkOutline',
	label: t('event.action.accept', 'Accept'),
	disabled: false,
	click: (ev: Event): void => acceptInvitation(ev, invite, context)
});

export const declineInvitationItem = (
	invite: Invite,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.DECLINE,
	icon: 'CloseOutline',
	label: t('event.action.decline', 'Decline'),
	disabled: false,
	click: (ev: Event): void => declineInvitation(ev, invite, context)
});

export const acceptAsTentativeItem = (
	invite: Invite,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.TENTATIVE,
	icon: 'QuestionMark',
	label: t('label.tentative', 'Tentative'),
	disabled: false,
	click: (ev: Event): void => acceptAsTentative(ev, invite, context)
});

export const moveAppointmentItem = (
	invite: Invite,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.MOVE,
	icon: 'MoveOutline',
	label:
		invite.ciFolder === FOLDERS.TRASH ? t('label.restore', 'Restore') : t('label.move', 'Move'),
	disabled: false,
	click: (ev: Event): void => moveAppointment(ev, invite, context)
});

export const moveApptToTrashItem = (
	invite: Invite,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.TRASH,
	icon: 'Trash2Outline',
	label: t('label.delete', 'Delete'),
	disabled: false,
	keepOpen: true,
	click: (ev: Event): void => moveToTrash(ev, invite, context)
});

export const deletePermanentlyItem = (
	invite: Invite,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: 'deletePermanently',
	icon: 'DeletePermanentlyOutline',
	label: t('label.delete_permanently', 'Delete permanently'),
	keepOpen: true,
	click: (ev: Event): void => deletePermanently(ev, invite, context)
});

export const editAppointmentItem = (
	invite: Invite,
	context: ActionsContext,
	t: TFunction
): any => ({
	id: EventActionsEnum.EDIT,
	icon: 'Edit2Outline',
	label: t('label.edit', 'Edit'),
	disabled: !invite.isOrganizer || !context?.haveWriteAccess,
	click: (ev: Event): void => editAppointment(ev, invite, context)
});

export const ActionsRetriever = (
	invite: Invite,
	context: ActionsContext,
	t: TFunction,
	includeReplyActions: boolean
): any =>
	// eslint-disable-next-line no-nested-ternary
	!invite.isOrganizer
		? invite.ciFolder === FOLDERS.TRASH
			? [
					deletePermanentlyItem(invite, context, t),
					moveAppointmentItem(invite, context, t),
					openInDisplayerItem(invite, context, t),
					applyTag({ t, context, invite })
			  ]
			: [
					openInDisplayerItem(invite, context, t),
					...(includeReplyActions
						? [
								acceptInvitationItem(invite, context, t),
								declineInvitationItem(invite, context, t),
								acceptAsTentativeItem(invite, context, t)
						  ]
						: []),
					moveAppointmentItem(invite, context, t),
					moveApptToTrashItem(invite, context, t),
					editAppointmentItem(invite, context, t),
					applyTag({ t, context, invite })
			  ]
		: invite.ciFolder === FOLDERS.TRASH
		? [
				deletePermanentlyItem(invite, context, t),
				moveAppointmentItem(invite, context, t),
				openInDisplayerItem(invite, context, t),
				applyTag({ t, context, invite })
		  ]
		: [
				openInDisplayerItem(invite, context, t),
				moveAppointmentItem(invite, context, t),
				moveApptToTrashItem(invite, context, t),
				editAppointmentItem(invite, context, t),
				applyTag({ t, context, invite })
		  ];

export const RecurrentActionRetriever = (
	invite: Invite,
	context: ActionsContext,
	t: TFunction
): any =>
	invite.ciFolder === FOLDERS.TRASH
		? [
				deletePermanentlyItem(invite, context, t),
				moveAppointmentItem(invite, context, t),
				openInDisplayerItem(invite, context, t),
				applyTag({ t, context, invite })
		  ]
		: [
				{
					id: 'instance',
					icon: 'CalendarOutline',
					label: t('label.instance', 'Instance'),
					click: (ev: Event): void => {
						if (ev) ev.preventDefault();
					},
					items: [
						moveApptToTrashItem(invite, { ...context, isInstance: true }, t),
						openInDisplayerItem(invite, context, t)
					]
				},
				{
					id: 'series',
					icon: 'CalendarOutline',
					label: t('label.series', 'Series'),
					click: (ev: Event): void => {
						if (ev) ev.preventDefault();
					},
					items: [
						moveApptToTrashItem(invite, { ...context, isInstance: false }, t),
						moveAppointmentItem(invite, context, t),
						applyTag({ t, context, invite })
					]
				}
		  ];

export const useEventActions = (
	invite: Invite,
	context: ActionsContext,
	t: TFunction,
	includeReplyActions = true
): any => {
	if (!invite) return [];
	return invite?.recurrenceRule
		? RecurrentActionRetriever(invite, context, t)
		: ActionsRetriever(invite, { ...context, isInstance: true }, t, includeReplyActions);
};
