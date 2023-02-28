/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ModalManagerContext, SnackbarManagerContext } from '@zextras/carbonio-design-system';
import { FOLDERS, replaceHistory, t, useTags } from '@zextras/carbonio-shell-ui';
import { omit } from 'lodash';
import { useContext, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	acceptAsTentativeItem,
	acceptInvitationItem,
	copyEventItem,
	declineInvitationItem,
	deleteEventItem,
	editEventItem,
	moveEventItem,
	openEventItem
} from '../actions/appointment-actions-items';
import { selectInstanceInvite } from '../store/selectors/invites';
import { PanelView } from '../types/actions';
import { EventType } from '../types/event';
import { applyTag, createAndApplyTag } from '../view/tags/tag-actions';
import { useCalendarFolders } from './use-calendar-folders';

const getInstanceActionsItems = ({ event, invite, context }: any): any => [
	openEventItem({
		event,
		context
	}),
	editEventItem({ event, invite, context }),
	deleteEventItem({ event, invite, context }),
	moveEventItem({ event, context }),
	copyEventItem({ event, invite, context }),
	applyTag({ event, context }),
	...(invite.isRespRequested
		? [
				acceptInvitationItem({ event, context }),
				declineInvitationItem({ event, context }),
				acceptAsTentativeItem({ event, context })
		  ]
		: [])
];

const getRecurrentActionsItems = ({ event, invite, context }: any): any => {
	const seriesEvent = { ...event, resource: omit(event.resource, 'ridZ') } as any;
	return [
		{
			id: 'instance',
			icon: 'CalendarOutline',
			label: t('label.instance', 'Instance'),
			click: (ev?: Event): void => {
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
				applyTag({ event, context }),
				...(invite.isRespRequested
					? [
							acceptInvitationItem({ event, context }),
							declineInvitationItem({ event, context }),
							acceptAsTentativeItem({ event, context })
					  ]
					: [])
			]
		},
		{
			id: 'series',
			icon: 'CalendarOutline',
			label: t('label.series', 'Series'),
			click: (ev?: Event): void => {
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
				applyTag({ event, context }),
				...(invite.isRespRequested
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

const getTrashActions = ({ event, invite, context }: any): any => {
	const seriesEvent = { ...event, resource: omit(event.resource, 'ridZ') } as any;
	return [
		openEventItem({
			event: seriesEvent,
			context
		}),
		editEventItem({ event: seriesEvent, invite, context }),
		deleteEventItem({ event: seriesEvent, invite, context }),
		moveEventItem({ event: seriesEvent, context }),
		copyEventItem({ event: seriesEvent, invite, context }),
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
}): any => {
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
			panelView: 'app',
			dispatch,
			createSnackbar,
			onClose,
			...context
		}),
		[calendarFolders, context, createModal, createSnackbar, dispatch, onClose, tags]
	);
	return useMemo(() => {
		if (!event || !invite) return undefined;

		const { isRecurrent, calendar } = event.resource;

		if (calendar.id === FOLDERS.TRASH) {
			return getTrashActions({ event, invite, context: _context });
		}
		return isRecurrent
			? getRecurrentActionsItems({ event, invite, context: _context })
			: getInstanceActionsItems({ event, invite, context: _context });
	}, [_context, event, invite]);
};
