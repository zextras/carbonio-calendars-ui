/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManagerContext, SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { FOLDERS, replaceHistory, t, useTags } from '@zextras/carbonio-shell-ui';
import { omit } from 'lodash';
import React, { useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	acceptAsTentativeItem,
	acceptInvitationItem,
	copyEventItem,
	declineInvitationItem,
	deleteEventItem,
	editEventItem,
	moveEventItem,
	openEventItem,
	showOriginal
} from '../actions/appointment-actions-items';
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
import { useCalendarFolders } from './use-calendar-folders';

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
	...(!event.resource.iAmOrganizer && !event.isShared
		? [
				acceptInvitationItem({ event, context }),
				declineInvitationItem({ event, context }),
				acceptAsTentativeItem({ event, context })
		  ]
		: [])
];

const getRecurrentActionsItems = ({ event, invite, context }: ActionsProps): SeriesActionsItems => {
	const seriesEvent = { ...event, resource: omit(event.resource, 'ridZ') } as EventType;
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
				...(!event.resource.iAmOrganizer && !event.isShared
					? [
							acceptInvitationItem({ event, context }),
							declineInvitationItem({ event, context }),
							acceptAsTentativeItem({ event, context })
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
				...(!event.resource.iAmOrganizer && !event.isShared
					? [
							acceptInvitationItem({ event: seriesEvent, context }),
							declineInvitationItem({ event: seriesEvent, context }),
							acceptAsTentativeItem({ event: seriesEvent, context })
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
	const invite = useSelector(selectInstanceInvite(event?.resource?.inviteId));
	const dispatch = useDispatch();
	const createModal = useContext(ModalManagerContext);
	const tags = useTags();
	const createSnackbar = useContext(SnackbarManagerContext);
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
