/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { t } from '@zextras/carbonio-shell-ui';
import { FOLDERS, hasId } from '@zextras/carbonio-ui-commons';
import { find } from 'lodash';

import {
	acceptAsAction,
	createCopy,
	deletePermanently,
	editAppointment,
	emailAttendees,
	exportAppointmentICSFn,
	moveAppointment,
	moveToTrash,
	openAppointment,
	proposeNewTimeFn
} from './appointment-actions-fn';
import { isExternalSyncFolder, isCaldavChild } from 'commons/utilities';
import { PARTICIPATION_STATUS } from 'constants/api';
import { EVENT_ACTIONS } from 'constants/event-actions';
import { InviteReplyVerb } from 'soap/send-invite-reply-request';
import { StoreProvider } from 'store/redux';
import { ActionsContext, ActionsProps, AppointmentActionsItems } from 'types/actions';
import { EventType } from 'types/event';
import { Invite } from 'types/store/invite';
import { isOrganizerOrHaveEqualRights } from 'utils/store/event';
import { ForwardAppointmentModal } from 'view/modals/forward-appointment/forward-appointment-modal';

/**
 * Get appropriate tooltip message for disabled actions based on calendar permissions
 */
export const getDisabledActionTooltip = (context: ActionsContext, event: EventType): string => {
	const folder = find(context.folders, ['id', event.resource.calendar.id]);
	if (!folder) {
		return t('label.no_rights', 'You do not have permission to perform this action');
	}

	const folderPerm = folder.perm ?? event.resource.calendar?.perm;
	const isReadOnly = folderPerm && !/w/.test(folderPerm);
	const isCaldav = isCaldavChild(folder);

	if (isCaldav && isReadOnly) {
		return t('tooltip.readonly_caldav_action', 'This calendar is read-only');
	}

	if (isReadOnly) {
		return t('tooltip.readonly_action', 'This calendar is read-only');
	}

	return t('label.no_rights', 'You do not have permission to perform this action');
};

export const openEventItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EVENT_ACTIONS.EXPAND,
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
	id: EVENT_ACTIONS.ACCEPT,
	icon: 'CheckmarkOutline',
	label: t('event.action.accept', 'Accept'),
	disabled: event?.resource?.participationStatus === PARTICIPATION_STATUS.ACCEPTED,
	tooltipLabel: t('label.action_performed', 'You already performed this action'),
	onClick: acceptAsAction({ actionType: InviteReplyVerb.ACCEPT, event, invite, context })
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
	id: EVENT_ACTIONS.DECLINE,
	icon: 'CloseOutline',
	label: t('event.action.decline', 'Decline'),
	disabled: event?.resource?.participationStatus === PARTICIPATION_STATUS.DECLINED,
	tooltipLabel: t('label.action_performed', 'You already performed this action'),
	onClick: acceptAsAction({ actionType: InviteReplyVerb.DECLINE, event, invite, context })
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
	id: EVENT_ACTIONS.TENTATIVE,
	icon: 'QuestionMarkOutline',
	label: t('label.tentative', 'Tentative'),
	disabled: event?.resource?.participationStatus === PARTICIPATION_STATUS.TENTATIVE,
	tooltipLabel: t('label.action_performed', 'You already performed this action'),
	onClick: acceptAsAction({ actionType: InviteReplyVerb.TENTATIVE, event, invite, context })
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
	id: EVENT_ACTIONS.PROPOSE_NEW_TIME,
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
}): AppointmentActionsItems | undefined => {
	const folder = find(context.folders, ['id', event.resource.calendar.id]);
	// External sync folders (ICS) don't support moving
	if (isExternalSyncFolder(folder ?? {})) {
		return undefined;
	}

	// Use folder-map permissions when present, otherwise fallback to event calendar permissions.
	const folderPerm = folder?.perm ?? event.resource.calendar?.perm;
	const hasWriteAccess = !folderPerm || /w/.test(folderPerm);
	if (!hasWriteAccess) {
		return undefined;
	}

	return {
		id: EVENT_ACTIONS.MOVE,
		icon: hasId(event.resource.calendar, FOLDERS.TRASH) ? 'RestoreOutline' : 'MoveOutline',
		label: hasId(event.resource.calendar, FOLDERS.TRASH)
			? t('label.restore', 'Restore')
			: t('label.move', 'Move'),
		disabled: !event?.haveWriteAccess,
		tooltipLabel: getDisabledActionTooltip(context, event),
		onClick: moveAppointment({ event, context })
	};
};

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
		id: EVENT_ACTIONS.EDIT,
		icon: 'Edit2Outline',
		label: t('label.edit', 'Edit'),
		disabled: !isOrganizerOrHaveEqualRights(event, absFolderPath),
		tooltipLabel: getDisabledActionTooltip(context, event),
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
	id: EVENT_ACTIONS.CREATE_COPY,
	icon: 'Copy',
	label: t('label.create_copy', 'Copy'),
	disabled: false,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: createCopy({ event, invite, context })
});

export const forwardEventItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EVENT_ACTIONS.FORWARD,
	icon: 'Forward',
	label: t('label.forward', 'Forward'),
	disabled: false,
	tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
	onClick: (): void => {
		context.createModal(
			{
				id: EVENT_ACTIONS.FORWARD,
				children: (
					<StoreProvider>
						<ForwardAppointmentModal
							event={event}
							onClose={(): void => {
								context.closeModal(EVENT_ACTIONS.FORWARD);
							}}
						/>
					</StoreProvider>
				),
				onClose: () => {
					context.closeModal(EVENT_ACTIONS.FORWARD);
				}
			},
			true
		);
	}
});
export const emailAttendeesEventItem = ({
	event,
	invite,
	context
}: {
	invite?: Invite;
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems => ({
	id: EVENT_ACTIONS.EMAIL_ATTEENDEES,
	icon: 'MailModOutline',
	label: t('label.email_attendees', 'Email attendees'),
	disabled: !event?.resource?.hasOtherAttendees,
	tooltipLabel: t('label.email_attendees', 'Email attendees'),
	onClick: (e) => emailAttendees({ event, invite, context }, e)
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
				id: EVENT_ACTIONS.DELETE_PERMANENTLY,
				icon: 'DeletePermanentlyOutline',
				label: t('label.delete_permanently', 'Delete permanently'),
				disabled: !event?.haveWriteAccess,
				tooltipLabel: getDisabledActionTooltip(context, event),
				onClick: deletePermanently({ event, context })
			}
		: {
				id: EVENT_ACTIONS.TRASH,
				icon: 'Trash2Outline',
				label: t('action.delete', 'Delete'),
				disabled: !event?.haveWriteAccess,
				tooltipLabel: getDisabledActionTooltip(context, event),
				onClick: moveToTrash({ event, invite, context })
			};

export const showOriginal = ({ event }: { event: EventType }): AppointmentActionsItems => ({
	id: EVENT_ACTIONS.SHOW_ORIGINAL,
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
	id: EVENT_ACTIONS.DOWNLOAD_ICS,
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
				id: EVENT_ACTIONS.ANSWER,
				icon: 'ReplyAll',
				items: getInviteActionsArray({ event, invite, context }),
				label: t('action.answer', 'Answer'),
				disabled: false,
				keepOpen: true,
				tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action')
			}
		: undefined;
