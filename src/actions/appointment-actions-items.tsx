/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS, t } from '@zextras/carbonio-shell-ui';
import { omit } from 'lodash';
import { ActionsContext, PanelView } from '../types/actions';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import {
	acceptAsTentative,
	acceptInvitation,
	createCopy,
	declineInvitation,
	deletePermanently,
	editAppointment,
	moveAppointment,
	moveToTrash,
	openAppointment
} from './appointment-actions-fn';

export const openAppointmentItem = ({
	event,
	panelView,
	context
}: {
	event: EventType;
	panelView: PanelView;
	context: any;
}): any => ({
	id: EventActionsEnum.EXPAND,
	icon: 'ExpandOutline',
	disabled: false,
	label: t('event.action.expand', 'Open in Displayer'),
	click: openAppointment({
		event,
		panelView,
		context
	})
});

export const acceptInvitationItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): any => ({
	id: EventActionsEnum.ACCEPT,
	icon: 'CheckmarkOutline',
	label: t('event.action.accept', 'Accept'),
	disabled: event?.resource?.participationStatus === 'AC',
	click: acceptInvitation({ event, context })
});

export const declineInvitationItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): any => ({
	id: EventActionsEnum.DECLINE,
	icon: 'CloseOutline',
	label: t('event.action.decline', 'Decline'),
	disabled: event?.resource?.participationStatus === 'DE',
	click: declineInvitation({ event, context })
});

export const acceptAsTentativeItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): any => ({
	id: EventActionsEnum.TENTATIVE,
	icon: 'QuestionMark',
	label: t('label.tentative', 'Tentative'),
	disabled: event?.resource?.participationStatus === 'TE',
	click: acceptAsTentative({ event, context })
});

export const moveAppointmentItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): any => ({
	id: EventActionsEnum.MOVE,
	icon: 'MoveOutline',
	label:
		event.resource.calendar.id === FOLDERS.TRASH
			? t('label.restore', 'Restore')
			: t('label.move', 'Move'),
	disabled: !event?.haveWriteAccess,
	click: moveAppointment({ event, context })
});

export const moveApptToTrashItem = ({
	invite,
	event,
	context
}: {
	invite: Invite;
	event: EventType;
	context: ActionsContext;
}): any => ({
	id: EventActionsEnum.TRASH,
	icon: 'Trash2Outline',
	label: t('label.delete', 'Delete'),
	disabled: !event?.haveWriteAccess,
	click: moveToTrash({ event, invite, context })
});

export const deletePermanentlyItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): any => ({
	id: 'deletePermanently',
	icon: 'DeletePermanentlyOutline',
	label: t('label.delete_permanently', 'Delete permanently'),
	click: deletePermanently({ event, context })
});

export const editAppointmentItem = ({
	invite,
	event,
	context
}: {
	invite: Invite;
	event: EventType;
	context: ActionsContext;
}): any => ({
	id: EventActionsEnum.EDIT,
	icon: 'Edit2Outline',
	label: t('label.edit', 'Edit'),
	disabled: !event?.haveWriteAccess,
	click: editAppointment({ event, invite, context })
});

export const createCopyItem = ({
	invite,
	event,
	context
}: {
	invite: Invite;
	event: EventType;
	context: ActionsContext;
}): any => ({
	id: EventActionsEnum.EDIT,
	icon: 'Copy',
	label: t('label.create_copy', 'Create a Copy'),
	disabled: false,
	click: createCopy({ event, invite, context })
});
