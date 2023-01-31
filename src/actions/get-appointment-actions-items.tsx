/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { PanelView } from '../types/actions';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { applyTag } from '../view/tags/tag-actions';
import {
	acceptAsTentativeItem,
	acceptInvitationItem,
	copyEventItem,
	declineInvitationItem,
	deletePermanentlyItem,
	editEventItem,
	moveEventItem,
	moveApptToTrashItem,
	openEventItem
} from './appointment-actions-items';

export const getAppointmentActionsItems = ({
	event,
	invite,
	context
}: {
	event: EventType;
	invite: Invite;
	panelView?: PanelView;
	context: any;
}): any => {
	if (event.resource.iAmOrganizer) {
		if (event.resource.calendar.id === FOLDERS.TRASH) {
			return [
				openEventItem({
					event,
					context
				}),
				moveEventItem({ event, context }),
				deletePermanentlyItem({ event, context }),
				copyEventItem({ event, invite, context })
			];
		}
		if (event.resource.calendar.id === FOLDERS.CALENDAR) {
			return [
				openEventItem({
					event,
					context
				}),
				editEventItem({ invite, event, context: { ...context } }),
				moveEventItem({ event, context }),
				moveApptToTrashItem({ invite, event, context: { ...context, isInstance: true } }),
				copyEventItem({ event, invite, context }),
				applyTag({
					event,
					context
				})
			];
		}
		if (event.haveWriteAccess) {
			return [
				openEventItem({
					event,
					context
				}),
				editEventItem({ invite, event, context: { ...context } }),
				moveEventItem({ event, context }),
				moveApptToTrashItem({ invite, event, context: { ...context, isInstance: true } }),
				copyEventItem({ event, invite, context }),
				applyTag({
					event,
					context
				})
			];
		}
		return [
			openEventItem({
				event,
				context
			}),
			copyEventItem({ event, invite, context })
		];
	}
	if (event.resource.calendar.id === FOLDERS.TRASH) {
		return [
			openEventItem({
				event,
				context
			}),
			deletePermanentlyItem({ event, context }),
			moveEventItem({ event, context }),
			copyEventItem({ event, invite, context })
		];
	}
	return [
		openEventItem({
			event,
			context
		}),
		acceptInvitationItem({ event, context }),
		declineInvitationItem({ event, context }),
		acceptAsTentativeItem({ event, context }),
		copyEventItem({ event, invite, context })
	];
};
