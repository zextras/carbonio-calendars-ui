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
	exportAppointmentICSFn,
	moveAppointment,
	moveToTrash,
	openAppointment,
	proposeNewTimeFn
} from './appointment-actions-fn';
import { hasId } from '../carbonio-ui-commons/worker/handle-message';
import { ActionsContext, ActionsProps, AppointmentActionsItems } from '../types/actions';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { isOrganizerOrHaveEqualRights } from '../utils/store/event';

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
	invite,
	context
}: {
	event: EventType;
	invite?: Invite;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.ACCEPT,
	icon: 'CheckmarkOutline',
	label: t('event.action.accept', 'Accept'),
	disabled: event?.resource?.participationStatus === 'AC',
	tooltipLabel: t('label.action_performed', 'You already performed this action'),
	onClick: acceptInvitation({ event, context, invite })
});

export const declineInvitationItem = ({
	event,
	invite,
	context
}: {
	event: EventType;
	invite?: Invite;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.DECLINE,
	icon: 'CloseOutline',
	label: t('event.action.decline', 'Decline'),
	disabled: event?.resource?.participationStatus === 'DE',
	tooltipLabel: t('label.action_performed', 'You already performed this action'),
	onClick: declineInvitation({ event, context, invite })
});

export const acceptAsTentativeItem = ({
	event,
	invite,
	context
}: {
	event: EventType;
	invite?: Invite;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.TENTATIVE,
	icon: 'QuestionMarkOutline',
	label: t('label.tentative', 'Tentative'),
	disabled: event?.resource?.participationStatus === 'TE',
	tooltipLabel: t('label.action_performed', 'You already performed this action'),
	onClick: acceptAsTentative({ event, context, invite })
});

export const proposeNewTimeItem = ({
	invite,
	event,
	context
}: {
	invite?: Invite;
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.PROPOSE_NEW_TIME,
	icon: 'ClockOutline',
	label: t('label.propose_new_time', 'Propose new time'),
	disabled: false,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: proposeNewTimeFn({ event, invite, context })
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
		disabled: !isOrganizerOrHaveEqualRights(event, absFolderPath),
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
				label: t('action.delete', 'Delete'),
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

export const exportAppointmentICSItem = ({
	event
}: {
	event: EventType;
}): AppointmentActionsItems => ({
	id: EventActionsEnum.DOWNLOAD_ICS,
	icon: 'Download',
	label: t('action.download_ics', 'Download ICS'),
	disabled: false,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: exportAppointmentICSFn({ event })
});

const getInviteActionsArray = ({
	event,
	context,
	invite
}: ActionsProps): AppointmentActionsItems[] => [
	acceptInvitationItem({ event, context }),
	acceptAsTentativeItem({ event, context }),
	declineInvitationItem({ event, context }),
	proposeNewTimeItem({ event, invite, context })
];

export const isAnInvite = (event: EventType): boolean => {
	if (event.resource.organizer) {
		return (
			!event.resource.iAmOrganizer &&
			event.haveWriteAccess &&
			((!!event.resource.calendar.owner &&
				event.resource.organizer &&
				event.resource.calendar.owner !== event.resource.organizer.email) ||
				!event.resource.calendar.owner)
		);
	}
	return false;
};

export const answerToEventItem = ({
	event,
	invite,
	context
}: {
	event: EventType;
	invite?: Invite;
	context: ActionsContext;
}): (AppointmentActionsItems & { items: Array<AppointmentActionsItems> }) | undefined =>
	isAnInvite(event)
		? {
				id: EventActionsEnum.ANSWER,
				icon: 'ReplyAll',
				items: getInviteActionsArray({ event, invite, context }),
				label: t('action.answer', 'Answer'),
				disabled: false,
				keepOpen: true,
				tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action')
			}
		: undefined;
