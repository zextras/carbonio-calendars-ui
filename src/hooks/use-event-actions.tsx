/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { FOLDERS, replaceHistory, t, useTags } from '@zextras/carbonio-shell-ui';
import { omit } from 'lodash';

import { useCalendarFolders } from './use-calendar-folders';
import {
	acceptAsTentativeItem,
	acceptInvitationItem,
	copyEventItem,
	declineInvitationItem,
	deleteEventItem,
	editEventItem,
	moveEventItem,
	openEventItem,
	proposeNewTimeItem,
	showOriginal
} from '../actions/appointment-actions-items';
import { useAppDispatch, useAppSelector } from '../store/redux/hooks';
import { selectInstanceInvite } from '../store/selectors/invites';
import {
	ActionsClick,
	ActionsProps,
	InstanceActionsItems,
	PanelView,
	SeriesActionsItems
} from '../types/actions';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { EventType } from '../types/event';
import { applyTag, createAndApplyTag } from '../view/tags/tag-actions';

export const isAnInvite = (event: EventType): boolean =>
	event.resource.organizer
		? !event.resource.iAmOrganizer &&
		  event.haveWriteAccess &&
		  ((!!event.resource.calendar.owner &&
				event.resource.organizer &&
				event.resource.calendar.owner !== event.resource.organizer.email) ||
				!event.resource.calendar.owner)
		: false;

const getInstanceActionsItems = ({
	event,
	invite,
	context
}: ActionsProps): InstanceActionsItems => [
	openEventItem({
		event,
		context
	}),
	editEventItem({ event, invite, context }),
	deleteEventItem({ event, invite, context }),
	moveEventItem({ event, context }),
	copyEventItem({ event, invite, context }),
	showOriginal({ event }),
	applyTag({ event, context }),
	...(isAnInvite(event)
		? [
				acceptInvitationItem({ event, context }),
				acceptAsTentativeItem({ event, context }),
				declineInvitationItem({ event, context }),
				proposeNewTimeItem({ event, invite, context })
		  ]
		: [])
];

const getRecurrentActionsItems = ({ event, invite, context }: ActionsProps): SeriesActionsItems => {
	const seriesEvent = { ...event, resource: omit(event.resource, 'ridZ') } as EventType;
	const contextOverride = { ...context, isInstance: true };
	return [
		{
			id: EventActionsEnum.INSTANCE,
			icon: 'CalendarOutline',
			label: t('label.instance', 'Instance'),
			disabled: false,
			tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
			onClick: (ev: ActionsClick): void => {
				if (ev) ev.preventDefault();
			},
			items: [
				openEventItem({
					event,
					context
				}),
				editEventItem({ event, invite, context }),
				deleteEventItem({ event, invite, context }),
				copyEventItem({ event, invite, context }),
				showOriginal({ event }),
				applyTag({ event, context }),
				...(isAnInvite(event)
					? [
							acceptInvitationItem({ event, invite, context: contextOverride }),
							acceptAsTentativeItem({ event, invite, context: contextOverride }),
							declineInvitationItem({ event, invite, context: contextOverride }),
							proposeNewTimeItem({ event, invite, context })
					  ]
					: [])
			]
		},
		{
			id: EventActionsEnum.SERIES,
			icon: 'CalendarOutline',
			label: t('label.series', 'Series'),
			disabled: false,
			tooltipLabel: t('label.no_rights', 'You do not have permission to perform this action'),
			onClick: (ev: ActionsClick): void => {
				if (ev) ev.preventDefault();
			},
			items: [
				openEventItem({
					event: seriesEvent,
					context
				}),
				editEventItem({ event: seriesEvent, invite, context }),
				deleteEventItem({ event: seriesEvent, invite, context }),
				moveEventItem({ event: seriesEvent, context }),
				copyEventItem({ event: seriesEvent, invite, context }),
				showOriginal({ event }),
				applyTag({ event, context }),
				...(isAnInvite(event)
					? [
							acceptInvitationItem({ event: seriesEvent, context }),
							acceptAsTentativeItem({ event: seriesEvent, context }),
							declineInvitationItem({ event: seriesEvent, context }),
							proposeNewTimeItem({ event: seriesEvent, invite, context })
					  ]
					: [])
			]
		}
	];
};

const getTrashActions = ({ event, invite, context }: ActionsProps): InstanceActionsItems => {
	const seriesEvent = { ...event, resource: omit(event.resource, 'ridZ') } as EventType;
	return [
		openEventItem({
			event: seriesEvent,
			context
		}),
		editEventItem({ event: seriesEvent, invite, context }),
		deleteEventItem({ event: seriesEvent, invite, context }),
		moveEventItem({ event: seriesEvent, context }),
		copyEventItem({ event: seriesEvent, invite, context }),
		showOriginal({ event }),
		applyTag({ event, context })
	];
};

export const useEventActions = ({
	onClose,
	event,
	context
}: {
	onClose?: () => void;
	event?: EventType;
	context?: { panelView: PanelView };
}): InstanceActionsItems | SeriesActionsItems | undefined => {
	const invite = useAppSelector(selectInstanceInvite(event?.resource?.inviteId));
	const dispatch = useAppDispatch();
	const createModal = useModal();
	const tags = useTags();
	const createSnackbar = useSnackbar();
	const calendarFolders = useCalendarFolders();
	const _context = useMemo(
		() => ({
			tags,
			folders: calendarFolders,
			createAndApplyTag,
			replaceHistory,
			createModal,
			panelView: 'app' as PanelView,
			dispatch,
			createSnackbar,
			onClose,
			...context
		}),
		[calendarFolders, context, createModal, createSnackbar, dispatch, onClose, tags]
	);
	return useMemo(() => {
		if (!event) return undefined;

		const { isRecurrent, calendar } = event.resource;

		if (calendar.id === FOLDERS.TRASH) {
			return getTrashActions({ event, invite, context: _context });
		}
		return isRecurrent
			? getRecurrentActionsItems({ event, invite, context: _context })
			: getInstanceActionsItems({ event, invite, context: _context });
	}, [_context, event, invite]);
};
