/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { differenceBy, find, isNil, noop, reject, toUpper } from 'lodash';
import { Button, Dropdown, Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import React, { ReactElement, useMemo } from 'react';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useEventActions } from '../../hooks/use-event-actions';
import {
	AppointmentActionsItems,
	InstanceActionsItems,
	SeriesActionsItems
} from '../../types/actions';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import { EventType } from '../../types/event';

const TrashActionsButtons = ({ actions }: { actions: InstanceActionsItems }): ReactElement => {
	const [t] = useTranslation();
	const primaryAction = useMemo(() => find(actions, ['id', EventActionsEnum.MOVE]), [actions]);
	const otherActions = useMemo(
		() => reject(actions, ['id', primaryAction?.id]),
		[actions, primaryAction?.id]
	);

	return (
		<Row width="fill" mainAlignment="flex-end" padding={{ all: 'small' }}>
			<Padding right="small" style={{ display: 'flex' }}>
				{primaryAction && (
					<Button type="outlined" label={primaryAction.label} onClick={primaryAction.onClick} />
				)}
				{otherActions?.length > 0 && (
					<Padding left="small">
						<Dropdown
							data-testid={`other-actions-options`}
							items={otherActions}
							placement="bottom-end"
						>
							<Button
								type="outlined"
								label={t('label.other_actions', 'Other actions')}
								icon="ChevronDown"
								onClick={noop}
							/>
						</Dropdown>
					</Padding>
				)}
			</Padding>
		</Row>
	);
};

const DropdownItemCustomComponent = ({
	color,
	icon,
	label
}: {
	color: string;
	icon: string;
	label: string;
}): ReactElement => (
	<Row>
		<Padding right="small">
			<Icon color={color} icon={icon} />
		</Padding>
		<Padding right="small">
			<Text>{toUpper(label)}</Text>
		</Padding>
	</Row>
);

const ResponseActionsButtons = ({
	actions,
	event
}: {
	actions: InstanceActionsItems | SeriesActionsItems;
	event: EventType;
}): ReactElement => {
	const [t] = useTranslation();
	const isResponseStillRequested =
		!isNil(event.resource?.participationStatus) && event.resource?.participationStatus === 'NE';
	const responseItems = useMemo<Array<AppointmentActionsItems> | undefined>(() => {
		const accept = find((actions as SeriesActionsItems)?.[0]?.items ?? actions, [
			'id',
			EventActionsEnum.ACCEPT
		]);
		const tentative = find((actions as SeriesActionsItems)?.[0]?.items ?? actions, [
			'id',
			EventActionsEnum.TENTATIVE
		]);
		const decline = find((actions as SeriesActionsItems)?.[0]?.items ?? actions, [
			'id',
			EventActionsEnum.DECLINE
		]);

		return accept && tentative && decline
			? [
					{
						...accept,
						customComponent: (
							<DropdownItemCustomComponent
								label={toUpper(t('event.action.yes', 'Yes'))}
								icon={'CheckmarkCircle2'}
								color={'success'}
							/>
						)
					},
					{
						...tentative,
						customComponent: (
							<DropdownItemCustomComponent
								label={toUpper(t('label.tentative', 'Tentative'))}
								icon={'QuestionMarkCircle'}
								color={'warning'}
							/>
						)
					},
					{
						...decline,
						customComponent: (
							<DropdownItemCustomComponent
								label={toUpper(t('event.action.no', 'No'))}
								icon={'CloseCircle'}
								color={'error'}
							/>
						)
					}
			  ]
			: undefined;
	}, [actions, t]);
	const primaryAction = useMemo(() => {
		if (isResponseStillRequested) {
			return {
				items: responseItems,
				label: t('event.action.needs_action', 'Needs action'),
				color: 'primary'
			};
		}

		if (event.resource?.participationStatus === 'AC') {
			return { items: responseItems, label: t('event.action.yes', 'Yes'), color: 'success' };
		}
		if (event.resource?.participationStatus === 'TE') {
			return { items: responseItems, label: t('label.tentative', 'Tentative'), color: 'warning' };
		}
		return { items: responseItems, label: t('event.action.no', 'No'), color: 'error' };
	}, [event.resource?.participationStatus, isResponseStillRequested, responseItems, t]);

	const secondaryActions = useMemo(() => {
		if (responseItems) {
			return (actions as SeriesActionsItems)?.[0]?.items
				? [
						{
							...(actions as SeriesActionsItems)[0],
							items: differenceBy((actions as SeriesActionsItems)?.[0]?.items, responseItems, 'id')
						},
						{
							...(actions as SeriesActionsItems)[1],
							items: differenceBy((actions as SeriesActionsItems)?.[1]?.items, responseItems, 'id')
						}
				  ]
				: differenceBy(actions, responseItems, 'id');
		}
		return undefined;
	}, [actions, responseItems]);
	return (
		<Row width="fill" mainAlignment="flex-end" padding={{ all: 'small' }}>
			<Padding right="small" style={{ display: 'flex' }}>
				{primaryAction && primaryAction?.items && primaryAction?.items?.length > 0 && (
					<Dropdown
						data-testid={`response-options`}
						items={primaryAction?.items}
						placement="bottom-end"
					>
						<Button
							type="outlined"
							label={primaryAction.label}
							icon="ChevronDown"
							onClick={noop}
							color={primaryAction.color}
						/>
					</Dropdown>
				)}
				{secondaryActions && secondaryActions?.length > 0 && (
					<Padding left="small">
						<Dropdown data-testid={`other-options`} items={secondaryActions} placement="bottom-end">
							<Button
								type="outlined"
								label={t('label.other_actions', 'Other actions')}
								icon="ChevronDown"
								onClick={noop}
							/>
						</Dropdown>
					</Padding>
				)}
			</Padding>
		</Row>
	);
};

const RecurrentActionsButtons = ({ actions }: { actions: SeriesActionsItems }): ReactElement => {
	const [t] = useTranslation();

	return (
		<Row width="fill" mainAlignment="flex-end" padding={{ all: 'small' }}>
			<Padding right="small" style={{ display: 'flex' }}>
				{actions?.[1]?.items?.length > 0 && (
					<Dropdown
						data-testid={`series-options`}
						items={actions?.[1]?.items}
						placement="bottom-end"
					>
						<Button
							type="outlined"
							label={t('label.series', 'SERIES')}
							icon="ChevronDown"
							onClick={noop}
						/>
					</Dropdown>
				)}
				{actions?.[0]?.items?.length > 0 && (
					<Padding left="small">
						<Dropdown
							data-testid={`instance-options`}
							items={actions?.[0]?.items}
							placement="bottom-end"
						>
							<Button
								type="outlined"
								label={t('label.instance', 'INSTANCE')}
								icon="ChevronDown"
								onClick={noop}
							/>
						</Dropdown>
					</Padding>
				)}
			</Padding>
		</Row>
	);
};

const InstanceActionsButtons = ({ actions }: { actions: InstanceActionsItems }): ReactElement => {
	const [t] = useTranslation();
	const primaryAction = useMemo(() => {
		const edit = find(actions, ['id', EventActionsEnum.EDIT]);
		const open = find(actions, ['id', EventActionsEnum.EXPAND]);
		if (!edit?.disabled) {
			return edit;
		}
		return open;
	}, [actions]);
	const secondaryActions = useMemo(
		() => reject(actions, ['id', primaryAction?.id]),
		[actions, primaryAction?.id]
	);

	return (
		<Row width="fill" mainAlignment="flex-end" padding={{ all: 'small' }}>
			<Padding right="small" style={{ display: 'flex' }}>
				{primaryAction && (
					<Button type="outlined" label={primaryAction.label} onClick={primaryAction.onClick} />
				)}
				{secondaryActions?.length > 0 && (
					<Padding left="small">
						<Dropdown
							data-testid={`other-actions-options`}
							items={secondaryActions}
							placement="bottom-end"
						>
							<Button
								type="outlined"
								label={t('label.other_actions', 'Other actions')}
								icon="ChevronDown"
								onClick={noop}
							/>
						</Dropdown>
					</Padding>
				)}
			</Padding>
		</Row>
	);
};

export const ActionsButtonsRow = ({
	onClose,
	event
}: {
	onClose: () => void;
	event: EventType;
}): ReactElement | null => {
	const actions = useEventActions({
		onClose,
		event
	});
	if (actions) {
		if (event.resource.calendar.id === FOLDERS.TRASH) {
			return <TrashActionsButtons actions={actions as InstanceActionsItems} />;
		}
		if (event.resource.isRecurrent) {
			if (event.resource.organizer && !event.resource.iAmOrganizer && !event.isShared) {
				return <ResponseActionsButtons actions={actions} event={event} />;
			}
			return <RecurrentActionsButtons actions={actions as SeriesActionsItems} />;
		}
		if (event.resource.organizer && !event.resource.iAmOrganizer && !event.isShared) {
			return <ResponseActionsButtons actions={actions} event={event} />;
		}
		return <InstanceActionsButtons actions={actions as InstanceActionsItems} />;
	}
	return null;
};
