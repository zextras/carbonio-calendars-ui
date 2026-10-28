/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import {
	FOLDERS,
	useHistoryNavigation,
	useFoldersMap,
	useSortedTagsArray,
	LinkFolder
} from '@zextras/carbonio-ui-commons';
import { compact, find, omit } from 'lodash';
import { useTranslation } from 'react-i18next';

import {
	answerToEventItem,
	copyEventItem,
	deleteEventItem,
	editEventItem,
	emailAttendeesEventItem,
	exportAppointmentICSItem,
	forwardEventItem,
	moveEventItem,
	openEventItem,
	showOriginal
} from '../actions/appointment-actions-items';
import { isLinkChild } from '../commons/utilities';
import { EVENT_ACTIONS } from '../constants/event-actions';
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
import { EventType } from '../types/event';
import { isOccurrenceOfSeries, toSeriesEvent } from '../utils/event';
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
		forwardEventItem({ event, context }),
		emailAttendeesEventItem({ event, invite, context }),
		showOriginal({ event }),
		applyTag({ event, context }),
		answerToEventItem({ event, invite, context }),
		getExportICSItem({ event, context })
	]);

const getRecurrentActionsItems = ({ event, invite, context }: ActionsProps): SeriesActionsItems => {
	const seriesEvent = toSeriesEvent(event);
	// the invite of an exception is not the series one: let the series actions fetch it
	const seriesInvite = event.resource.isException ? undefined : invite;
	const contextOverride = { ...context, isInstance: true };
	return [
		{
			id: EVENT_ACTIONS.INSTANCE,
			icon: 'CalendarOutline',
			label: context.t('label.instance', 'Instance'),
			disabled: false,
			tooltipLabel: context.t(
				'label.no_rights',
				'You do not have permission to perform this action'
			),
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
				forwardEventItem({ event, context }),
				emailAttendeesEventItem({ event, invite, context }),
				showOriginal({ event }),
				answerToEventItem({ event, invite, context: contextOverride })
			])
		},
		{
			id: EVENT_ACTIONS.SERIES,
			icon: 'CalendarOutline',
			label: context.t('label.series', 'Series'),
			disabled: false,
			tooltipLabel: context.t(
				'label.no_rights',
				'You do not have permission to perform this action'
			),
			onClick: (ev: ActionsClick): void => {
				if (ev) ev.preventDefault();
			},
			items: compact([
				openEventItem({
					event: seriesEvent,
					context
				}),
				editEventItem({ event: seriesEvent, invite: seriesInvite, context }),
				deleteEventItem({ event: seriesEvent, invite: seriesInvite, context }),
				moveEventItem({ event: seriesEvent, context }),
				copyEventItem({ event: seriesEvent, invite: seriesInvite, context }),
				forwardEventItem({ event, context }),
				showOriginal({ event }),
				// tags belong to the whole appointment: the server cannot tag a single occurrence
				applyTag({ event: seriesEvent, context }),
				answerToEventItem({ event: seriesEvent, invite: seriesInvite, context }),
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
	const [t] = useTranslation();
	const { replaceHistory } = useHistoryNavigation();
	const invite = useAppSelector(selectInstanceInvite(event?.resource?.inviteId));
	const dispatch = useAppDispatch();
	const { createModal, closeModal } = useModal();
	const tags = useSortedTagsArray();
	const createSnackbar = useSnackbar();
	const calendarFolders = useFoldersMap();
	const _context = useMemo<ActionsContext>(
		() => ({
			tags,
			folders: calendarFolders,
			createAndApplyTag,
			replaceHistory,
			t,
			createModal,
			closeModal,
			panelView: 'app' as PanelView,
			dispatch,
			createSnackbar,
			onClose,
			...context
		}),
		[
			calendarFolders,
			closeModal,
			context,
			createModal,
			createSnackbar,
			dispatch,
			replaceHistory,
			onClose,
			t,
			tags
		]
	);
	return useMemo(() => {
		if (!event) return undefined;

		if (event.resource.calendar.id === FOLDERS.TRASH) {
			return getTrashActions({ event, invite, context: _context });
		}
		return isOccurrenceOfSeries(event.resource)
			? getRecurrentActionsItems({ event, invite, context: _context })
			: getInstanceActionsItems({ event, invite, context: _context });
	}, [_context, event, invite]);
};
