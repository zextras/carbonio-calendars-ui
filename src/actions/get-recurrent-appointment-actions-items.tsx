/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS, getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import { omit } from 'lodash';
import { GetActionReturnType } from '../hooks/types';
import { PanelView } from '../types/actions';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { applyTag } from '../view/tags/tag-actions';
import {
	deletePermanentlyItem,
	editAppointmentItem,
	moveAppointmentItem,
	moveApptToTrashItem,
	openAppointmentItem
} from './appointment-actions-items';

export const getRecurrentAppointmentActionsItems = ({
	event,
	invite,
	panelView = 'app',
	context
}: {
	event: EventType;
	invite: Invite;
	panelView?: PanelView;
	context: any;
}): GetActionReturnType => {
	const seriesEvent = { ...event, resource: omit(event.resource, 'ridZ') } as any;
	if (event.resource.calendar.id === FOLDERS.TRASH) {
		return [
			openAppointmentItem({
				event,
				panelView,
				context
			}),
			deletePermanentlyItem({ event, context }),
			moveAppointmentItem({ event, context })
		];
	}
	return [
		{
			id: 'instance',
			icon: 'CalendarOutline',
			label: getBridgedFunctions().t('label.instance', 'Instance'),
			click: (ev: MouseEvent | undefined): void => {
				if (ev) ev.preventDefault();
			},
			items: [
				openAppointmentItem({
					event,
					panelView: 'app',
					context
				}),
				editAppointmentItem({ invite, event, context: { ...context, panelView } }),
				event.resource.calendar.id === FOLDERS.TRASH
					? deletePermanentlyItem({ event, context })
					: moveApptToTrashItem({ invite, event, context: { ...context, isInstance: true } })
			]
		},
		{
			id: 'series',
			icon: 'CalendarOutline',
			label: getBridgedFunctions().t('label.series', 'Series'),
			click: (ev: MouseEvent | undefined): void => {
				if (ev) ev.preventDefault();
			},
			items: [
				openAppointmentItem({
					event: seriesEvent,
					panelView: 'app',
					context
				}),
				editAppointmentItem({ invite, event: seriesEvent, context: { ...context, panelView } }),
				event.resource.calendar.id === FOLDERS.TRASH
					? deletePermanentlyItem({ event: seriesEvent, context })
					: moveApptToTrashItem({ invite, event, context: { ...context, isInstance: false } }),
				moveAppointmentItem({ event: seriesEvent, context }),
				applyTag({
					event,
					context
				})
			]
		}
	];
};
