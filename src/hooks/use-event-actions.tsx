/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { TFunction } from 'i18next';
import {
	acceptAsTentativeItem,
	acceptInvitationItem,
	declineInvitationItem,
	deletePermanentlyItem,
	editAppointmentItem,
	moveAppointmentItem,
	moveApptToTrashItem,
	openInDisplayerItem
} from '../actions/action-items';
import { ActionsContext } from '../types/actions';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { applyTag } from '../view/tags/tag-actions';

export const ActionsRetriever = (
	invite: Invite,
	event: EventType,
	context: ActionsContext,
	t: TFunction,
	includeReplyActions: boolean
): any =>
	// eslint-disable-next-line no-nested-ternary
	!invite.isOrganizer
		? event.resource.calendar.id === FOLDERS.TRASH
			? [
					deletePermanentlyItem(invite, event, context, t),
					moveAppointmentItem(event, invite, context, t),
					openInDisplayerItem(event, context, t),
					applyTag({ t, context, event })
			  ]
			: [
					openInDisplayerItem(event, context, t),
					...(includeReplyActions
						? [
								acceptInvitationItem(event, context, t),
								declineInvitationItem(event, context, t),
								acceptAsTentativeItem(event, context, t)
						  ]
						: []),
					moveAppointmentItem(event, invite, context, t),
					moveApptToTrashItem(invite, event, context, t),
					editAppointmentItem(invite, event, context, t),
					applyTag({ t, context, event })
			  ]
		: event.resource.calendar.id === FOLDERS.TRASH
		? [
				deletePermanentlyItem(invite, event, context, t),
				moveAppointmentItem(event, invite, context, t),
				openInDisplayerItem(event, context, t),
				applyTag({ t, context, event })
		  ]
		: [
				openInDisplayerItem(event, context, t),
				moveAppointmentItem(event, invite, context, t),
				moveApptToTrashItem(invite, event, context, t),
				editAppointmentItem(invite, event, context, t),
				applyTag({ t, context, event })
		  ];

export const RecurrentActionRetriever = (
	invite: Invite,
	event: EventType,
	context: ActionsContext,
	t: TFunction
): any => {
	const instanceContext = {
		...context,
		isInstance: true,
		isSeries: true,
		isException: event.resource.isException ?? false
	};
	const seriesContext = {
		...context,
		isInstance: false,
		isSeries: true,
		isException: event.resource.isException ?? false
	};
	return event.resource.calendar.id === FOLDERS.TRASH
		? [
				deletePermanentlyItem(invite, event, instanceContext, t),
				moveAppointmentItem(event, invite, instanceContext, t),
				openInDisplayerItem(event, instanceContext, t),
				applyTag({ t, context: instanceContext, event })
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
						moveApptToTrashItem(invite, event, instanceContext, t),
						openInDisplayerItem(event, instanceContext, t)
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
						moveApptToTrashItem(invite, event, seriesContext, t),
						moveAppointmentItem(event, invite, seriesContext, t),
						applyTag({ t, context: seriesContext, event })
					]
				}
		  ];
};
export const useEventActions = (
	invite: Invite | undefined,
	event: EventType,
	context: ActionsContext,
	t: TFunction,
	includeReplyActions = true
): any => {
	if (!invite) return [];
	return event.resource.isRecurrent
		? RecurrentActionRetriever(invite, event, context, t)
		: ActionsRetriever(
				invite,
				event,
				{ ...context, isSeries: false, isInstance: true, isException: event.resource.isException },
				t,
				includeReplyActions
		  );
};
