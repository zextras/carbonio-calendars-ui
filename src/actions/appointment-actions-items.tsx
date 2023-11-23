/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS, t } from '@zextras/carbonio-shell-ui';
import { find } from 'lodash';

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
import { isTrashOrNestedInIt } from '../carbonio-ui-commons/store/zustand/folder/utils';
import { hasId } from '../carbonio-ui-commons/worker/handle-message';
import { ActionsContext, AppointmentActionsItems } from '../types/actions';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';

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
	onClick: openAppointment({
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
	onClick: acceptInvitation({ event, context })
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
	onClick: declineInvitation({ event, context })
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
	onClick: acceptAsTentative({ event, context })
});

export const moveEventItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.MOVE,
	icon: hasId(event.resource.calendar, FOLDERS.TRASH) ? 'RestoreOutline' : 'MoveOutline',
	label: hasId(event.resource.calendar, FOLDERS.TRASH)
		? t('label.restore', 'Restore')
		: t('label.move', 'Move'),
	disabled: !event?.haveWriteAccess,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: moveAppointment({ event, context })
});

export const moveApptToTrashItem = ({
	invite,
	event,
	context
}: {
	invite?: Invite;
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.TRASH,
	icon: 'Trash2Outline',
	label: t('label.delete', 'Delete'),
	disabled: !event?.haveWriteAccess,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: moveToTrash({ event, invite, context })
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
	onClick: deletePermanently({ event, context })
});

export const editEventItem = ({
	invite,
	event,
	context
}: {
	invite?: Invite;
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => {
	const absFolderPath = find(context.folders, ['id', event.resource.calendar.id])?.absFolderPath;
	return {
		id: EventActionsEnum.EDIT,
		icon: 'Edit2Outline',
		label: t('label.edit', 'Edit'),
		disabled:
			// if the event is in trash or nested in it
			isTrashOrNestedInIt({ id: event.resource.calendar.id, absFolderPath }) ||
			// if user is owner of the calendar but he is not the organizer
			(!event.resource.calendar.owner && !event.resource.iAmOrganizer) ||
			// if it is inside a shared calendar or user doesn't have write access
			(!!event.resource.calendar.owner &&
				(event.resource.calendar.owner !== event.resource.organizer.email ||
					!event?.haveWriteAccess)),
		tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
		onClick: editAppointment({ event, invite, context })
	};
};
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
	onClick: createCopy({ event, invite, context })
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
	hasId(event.resource.calendar, FOLDERS.TRASH)
		? {
				id: EventActionsEnum.DELETE_PERMANENTLY,
				icon: 'DeletePermanentlyOutline',
				label: t('label.delete_permanently', 'Delete permanently'),
				disabled: !event?.haveWriteAccess,
				tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
				onClick: deletePermanently({ event, context })
		  }
		: {
				id: EventActionsEnum.TRASH,
				icon: 'Trash2Outline',
				label: t('label.delete', 'Delete'),
				disabled: !event?.haveWriteAccess,
				tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
				onClick: moveToTrash({ event, invite, context })
		  };

export const showOriginal = ({ event }: { event: EventType }): AppointmentActionsItems => ({
	id: EventActionsEnum.SHOW_ORIGINAL,
	icon: 'CodeOutline',
	label: t('action.show_original', 'Show original'),
	disabled: false,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: (ev): void => {
		if (ev) ev.preventDefault();
		window.open(
			`/service/home/~/?auth=co&id=${event.resource.id}&mime=text/plain&noAttach=1&icalAttach=none`,
			'_blank'
		);
	}
});
