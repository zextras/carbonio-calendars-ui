/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { FOLDERS, replaceHistory, t, useTags } from '@zextras/carbonio-shell-ui';
import { compact, find, omit } from 'lodash';

import {
	answerToEventItem,
	copyEventItem,
	deleteEventItem,
	editEventItem,
	exportAppointmentICSItem,
	moveEventItem,
	openEventItem,
	showOriginal
} from '../actions/appointment-actions-items';
import { useFoldersMap } from '../carbonio-ui-commons/store/zustand/folder';
import { LinkFolder } from '../carbonio-ui-commons/types/folder';
import { isLinkChild } from '../commons/utilities';
import { useAppDispatch, useAppSelector } from '../store/redux/hooks';
import { selectInstanceInvite } from '../store/selectors/invites';
import {
	ActionsClick,
	ActionsContext,
	ActionsProps,
	AppointmentActionsItems,
	InstanceActionsItems,
	PanelView,
	SeriesActionsItems
} from '../types/actions';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { EventType } from '../types/event';
import { applyTag, createAndApplyTag } from '../view/tags/tag-actions';

const getExportICSItem = ({
	event,
	context
}: {
	event: EventType;
	context: ActionsContext;
}): AppointmentActionsItems | false | undefined => {
	const folder = find(context.folders, ['id', event.resource.calendar.id]);
	return (
		folder &&
		(!(folder as LinkFolder).isLink || isLinkChild(folder)) &&
		exportAppointmentICSItem({ event })
	);
};

const getInstanceActionsItems = ({ event, invite, context }: ActionsProps): InstanceActionsItems =>
	compact([
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
		answerToEventItem({ event, invite, context }),
		getExportICSItem({ event, context })
	]);

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
			items: compact([
				openEventItem({
					event,
					context
				}),
				editEventItem({ event, invite, context }),
				deleteEventItem({ event, invite, context }),
				copyEventItem({ event, invite, context }),
				showOriginal({ event }),
				applyTag({ event, context }),
				answerToEventItem({ event, invite, context: contextOverride })
			])
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
			items: compact([
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
				answerToEventItem({ event: seriesEvent, invite, context }),
				getExportICSItem({ event: seriesEvent, context })
			])
		}
	];
};

const getTrashActions = ({ event, invite, context }: ActionsProps): InstanceActionsItems => {
	const seriesEvent = { ...event, resource: omit(event.resource, 'ridZ') } as EventType;
	return compact([
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
		getExportICSItem({ event: seriesEvent, context })
	]);
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
	const calendarFolders = useFoldersMap();
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
