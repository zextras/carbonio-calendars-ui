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
	declineInvitationItem,
	deletePermanentlyItem,
	editAppointmentItem,
	moveAppointmentItem,
	moveApptToTrashItem,
	openAppointmentItem
} from './appointment-actions-items';

export const getAppointmentActionsItems = ({
	event,
	invite,
	panelView = 'app',
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
				openAppointmentItem({
					event,
					panelView,
					context
				}),
				moveAppointmentItem({ event, context }),
				deletePermanentlyItem({ event, context })
			];
		}
		return [
			openAppointmentItem({
				event,
				panelView,
				context
			}),
			moveAppointmentItem({ event, context }),
			moveApptToTrashItem({ invite, event, context: { ...context, isInstance: true } }),
			applyTag({
				event,
				context
			})
		];
	}
	if (event.resource.calendar.id === FOLDERS.TRASH) {
		return [
			openAppointmentItem({
				event,
				panelView,
				context
			}),
			deletePermanentlyItem({ event, context }),
			moveAppointmentItem({ event, context })
		];
	}
	return [
		openAppointmentItem({
			event,
			panelView,
			context
		}),
		moveAppointmentItem({ event, context }),
		moveApptToTrashItem({ invite, event, context: { ...context, isInstance: true } }),
		editAppointmentItem({ invite, event, context }),
		acceptInvitationItem({ event, context }),
		declineInvitationItem({ event, context }),
		acceptAsTentativeItem({ event, context }),
		applyTag({
			event,
			context
		})
	];
};
