/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS, t } from '@zextras/carbonio-shell-ui';
import { ActionsContext, AppointmentActionsItems } from '../types/actions';
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

export const openEventItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.EXPAND,
	icon: 'ExpandOutline',
	disabled: false,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	label: t('event.action.expand', 'Open'),
	click: openAppointment({
		event,
		context
	})
});

export const acceptInvitationItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.ACCEPT,
	icon: 'CheckmarkOutline',
	label: t('event.action.accept', 'Accept'),
	disabled: event?.resource?.participationStatus === 'AC',
	tooltipLabel: t('label.action_performed', 'You already performed this action'),
	click: acceptInvitation({ event, context })
});

export const declineInvitationItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.DECLINE,
	icon: 'CloseOutline',
	label: t('event.action.decline', 'Decline'),
	disabled: event?.resource?.participationStatus === 'DE',
	tooltipLabel: t('label.action_performed', 'You already performed this action'),
	click: declineInvitation({ event, context })
});

export const acceptAsTentativeItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.TENTATIVE,
	icon: 'QuestionMark',
	label: t('label.tentative', 'Tentative'),
	disabled: event?.resource?.participationStatus === 'TE',
	tooltipLabel: t('label.action_performed', 'You already performed this action'),
	click: acceptAsTentative({ event, context })
});

export const moveEventItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.MOVE,
	icon: event.resource.calendar.id === FOLDERS.TRASH ? 'RestoreOutline' : 'MoveOutline',
	label:
		event.resource.calendar.id === FOLDERS.TRASH
			? t('label.restore', 'Restore')
			: t('label.move', 'Move'),
	disabled: !event?.haveWriteAccess,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
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
}): AppointmentActionsItems => ({
	id: EventActionsEnum.TRASH,
	icon: 'Trash2Outline',
	label: t('label.delete', 'Delete'),
	disabled: !event?.haveWriteAccess,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	click: moveToTrash({ event, invite, context })
});

export const deletePermanentlyItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.DELETE_PERMANENTLY,
	icon: 'DeletePermanentlyOutline',
	label: t('label.delete_permanently', 'Delete permanently'),
	disabled: false,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	click: deletePermanently({ event, context })
});

export const editEventItem = ({
	invite,
	event,
	context
}: {
	invite?: Invite;
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.EDIT,
	icon: 'Edit2Outline',
	label: t('label.edit', 'Edit'),
	disabled:
		!event?.haveWriteAccess ||
		event.resource.calendar.id === FOLDERS.TRASH ||
		!event.resource.iAmOrganizer,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	click: editAppointment({ event, invite, context })
});

export const copyEventItem = ({
	invite,
	event,
	context
}: {
	invite?: Invite;
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.CREATE_COPY,
	icon: 'Copy',
	label: t('label.create_copy', 'Copy'),
	disabled: false,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	click: createCopy({ event, invite, context })
});

export const deleteEventItem = ({
	invite,
	event,
	context
}: {
	invite?: Invite;
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems =>
	event.resource.calendar.id === FOLDERS.TRASH
		? {
				id: EventActionsEnum.DELETE_PERMANENTLY,
				icon: 'DeletePermanentlyOutline',
				label: t('label.delete_permanently', 'Delete permanently'),
				disabled: !event?.haveWriteAccess,
				tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
				click: deletePermanently({ event, context })
		  }
		: {
				id: EventActionsEnum.TRASH,
				icon: 'Trash2Outline',
				label: t('label.delete', 'Delete'),
				disabled: !event?.haveWriteAccess,
				tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
				click: moveToTrash({ event, invite, context })
		  };
