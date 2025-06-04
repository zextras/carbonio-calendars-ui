/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Button, Dropdown, Row, Tooltip } from '@zextras/carbonio-design-system';
import { FOLDERS, hasId } from '@zextras/carbonio-ui-commons';
import { filter, find, noop } from 'lodash';

import { EVENT_ACTIONS } from '../../constants/event-actions';
import {
	AppointmentActionsItems,
	InstanceActionsItems,
	SeriesActionsItems
} from '../../types/actions';
import { EventType } from '../../types/event';

export type ActionItems = SeriesActionsItems | InstanceActionsItems | undefined;

function isSeriesItems(actions: ActionItems): actions is SeriesActionsItems {
	return !!actions && (actions?.length ?? 0) === 2 && !!actions[1] && 'items' in actions[1];
}

function getSeriesActionItems(event: EventType, actions: ActionItems): AppointmentActionsItems[] {
	if (isSeriesItems(actions)) {
		return actions[1].items;
	}
	return [];
}

function getInstanceActionItems(event: EventType, actions: ActionItems): AppointmentActionsItems[] {
	if (isSeriesItems(actions)) {
		return actions[0].items;
	}
	return actions ?? [];
}

function getPreferredAction(
	event: EventType,
	items: AppointmentActionsItems[]
): AppointmentActionsItems | undefined {
	const move = find(items, ['id', EVENT_ACTIONS.MOVE]);
	const edit = find(items, ['id', EVENT_ACTIONS.EDIT]);
	const copy = find(items, ['id', EVENT_ACTIONS.CREATE_COPY]);
	if (!event.resource.iAmOrganizer && !event.isShared) {
		if (edit && !edit.disabled) {
			return edit;
		}
		return move ?? copy;
	}
	if (edit && !edit.disabled) {
		return edit;
	}
	return copy;
}

function getPrimaryAction(
	event: EventType,
	seriesItems: AppointmentActionsItems[],
	instanceItems: AppointmentActionsItems[]
): AppointmentActionsItems | undefined {
	if (event) {
		if (hasId(event.resource.calendar, FOLDERS.TRASH)) {
			return find(instanceItems, ['id', EVENT_ACTIONS.MOVE]);
		}
		if (!event.resource.ridZ) {
			return getPreferredAction(event, seriesItems);
		}
		return getPreferredAction(event, instanceItems);
	}
	return undefined;
}

export const EXCLUDED_ACTIONS = [
	EVENT_ACTIONS.EXPAND,
	EVENT_ACTIONS.ACCEPT,
	EVENT_ACTIONS.TENTATIVE,
	EVENT_ACTIONS.DECLINE,
	EVENT_ACTIONS.PROPOSE_NEW_TIME
];

export default function ActionButtons({
	actions,
	event
}: {
	actions: ActionItems;
	event: EventType;
}): ReactElement | null {
	const seriesItems = getSeriesActionItems(event, actions);
	const instanceItems = getInstanceActionItems(event, actions);
	const primaryAction = useMemo(
		() => getPrimaryAction(event, seriesItems, instanceItems),
		[seriesItems, instanceItems, event]
	);

	const secondaryAction = useMemo(() => {
		if (event?.resource?.hasOtherAttendees) {
			return find(event.resource.ridZ ? instanceItems : seriesItems, [
				'id',
				EVENT_ACTIONS.EMAIL_ATTEENDEES
			]);
		}

		return undefined;
	}, [instanceItems, seriesItems, event]);

	const otherActions = useMemo(() => {
		if (event && primaryAction) {
			return filter(
				event.resource.ridZ ? instanceItems : seriesItems,
				(a) =>
					!a.disabled &&
					![primaryAction.id, secondaryAction?.id, ...EXCLUDED_ACTIONS].includes(a.id)
			);
		}
		return undefined;
	}, [instanceItems, seriesItems, event, primaryAction, secondaryAction]);

	return primaryAction ? (
		<Row wrap="nowrap" height="100%" mainAlignment="flex-end" style={{ maxWidth: '10rem' }}>
			<Row height="2.5rem" mainAlignment="flex-start" style={{ overflow: 'hidden' }}>
				{primaryAction ? (
					<Tooltip placement="top" label={primaryAction.label}>
						<Button
							type="ghost"
							color="text"
							key={primaryAction.id}
							icon={primaryAction.icon}
							onClick={primaryAction.onClick ?? noop}
						/>
					</Tooltip>
				) : null}
				{secondaryAction && !secondaryAction.disabled && (
					<Tooltip placement="top" label={secondaryAction.label}>
						<Button
							type="ghost"
							color="text"
							key={secondaryAction.id}
							icon={secondaryAction.icon}
							onClick={secondaryAction.onClick ?? noop}
						/>
					</Tooltip>
				)}
			</Row>
			{otherActions && otherActions?.length > 0 && (
				<>
					{otherActions.length > 1 ? (
						<Dropdown items={otherActions}>
							<Row takeAvailableSpace>
								<Button type="ghost" color="text" icon="MoreVertical" onClick={noop} />
							</Row>
						</Dropdown>
					) : (
						<Tooltip placement="top" label={otherActions?.[0]?.label}>
							<Button
								type="ghost"
								color="text"
								key={otherActions?.[0]?.id}
								icon={otherActions?.[0]?.icon}
								onClick={otherActions?.[0]?.onClick ?? noop}
							/>
						</Tooltip>
					)}
				</>
			)}
		</Row>
	) : null;
}
