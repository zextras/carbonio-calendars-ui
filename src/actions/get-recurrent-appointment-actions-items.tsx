/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS, t } from '@zextras/carbonio-shell-ui';
import { omit } from 'lodash';
import { GetActionReturnType } from '../hooks/types';
import { EventType } from '../types/event';
import { Invite } from '../types/store/invite';
import { applyTag } from '../view/tags/tag-actions';
import {
	copyEventItem,
	deletePermanentlyItem,
	editEventItem,
	moveEventItem,
	moveApptToTrashItem,
	openEventItem
} from './appointment-actions-items';

export const getRecurrentAppointmentActionsItems = ({
	event,
	invite,
	context
}: {
	event: EventType;
	invite: Invite;
	context: any;
}): GetActionReturnType => {
	const seriesEvent = { ...event, resource: omit(event.resource, 'ridZ') } as any;
	if (event.resource.calendar.id === FOLDERS.TRASH) {
		return [
			openEventItem({
				event,
				context
			}),
			deletePermanentlyItem({ event, context }),
			moveEventItem({ event, context }),
			copyEventItem({ event: seriesEvent, invite, context })
		];
	}
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
				copyEventItem({ event: seriesEvent, invite, context }),
				editEventItem({ invite, event, context }),
				event.resource.calendar.id === FOLDERS.TRASH
					? deletePermanentlyItem({ event, context })
					: moveApptToTrashItem({ invite, event, context: { ...context, isInstance: true } })
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
				copyEventItem({ event: seriesEvent, invite, context }),
				editEventItem({ invite, event: seriesEvent, context }),
				event.resource.calendar.id === FOLDERS.TRASH
					? deletePermanentlyItem({ event: seriesEvent, context })
					: moveApptToTrashItem({ invite, event, context: { ...context, isInstance: false } }),
				moveEventItem({ event: seriesEvent, context }),
				applyTag({
					event,
					context
				})
			]
		}
	];
};
