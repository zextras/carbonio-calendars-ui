/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import moment from 'moment';
import { Dropdown, Icon, Padding, Row, Text, Tooltip } from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { includes, reduce } from 'lodash';
import { Tags, ZIMBRA_STANDARD_COLORS, Tag, t } from '@zextras/carbonio-shell-ui';
import { EventType } from '../../types/event';
import { useTagExist } from '../tags/tag-actions';

const NeedActionIcon = styled(Icon)`
	position: relative;
	top: -0.0625rem;
`;

type TagItems = Tag & {
	customComponent: ReactElement;
	label: string;
};

type CustomEventComponentProps = {
	event: EventType;
	tags: Tags;
	title: string;
};

export const CustomEventComponent = ({
	event,
	tags,
	title
}: CustomEventComponentProps): ReactElement => {
	const [showDropdown, setShowDropdown] = useState(false);
	const onIconClick = useCallback((ev) => {
		ev.stopPropagation();
		setShowDropdown((o) => !o);
	}, []);

	const onDropdownClose = useCallback(() => {
		setShowDropdown(false);
	}, []);

	const tagItems = useMemo(
		() =>
			reduce(
				tags,
				(acc: Array<Tag>, v) => {
					if (includes(event?.resource?.tags, v.id)) {
						return [...acc, v];
					}
					return acc;
				},
				[]
			),
		[event?.resource?.tags, tags]
	);
	const tagIcon = useMemo(() => (tagItems?.length > 1 ? 'TagsMoreOutline' : 'Tag'), [tagItems]);
	const tagIconColor = useMemo(
		() =>
			tagItems?.length === 1 && tagItems?.[0]?.color
				? ZIMBRA_STANDARD_COLORS[tagItems?.[0]?.color]?.hex
				: undefined,
		[tagItems]
	);
	const tagName = useMemo(() => (tagItems?.length === 1 ? tagItems?.[0]?.name : ''), [tagItems]);
	const isTagInStore = useTagExist(tagItems);
	const showMultiTagIcon = useMemo(
		() => event?.resource?.tags?.length > 1,
		[event?.resource?.tags]
	);
	const showTagIcon = useMemo(
		() =>
			event?.resource?.tags &&
			event?.resource?.tags?.length !== 0 &&
			event?.resource?.tags?.[0] !== '' &&
			!showMultiTagIcon &&
			isTagInStore,
		[event?.resource?.tags, showMultiTagIcon, isTagInStore]
	);

	const eventDiff = useMemo(
		() => moment(event.end).diff(event.start, 'minutes'),
		[event.start, event.end]
	);

	const tagsDropdownItems = useMemo(
		() =>
			reduce(
				tags,
				(acc: Array<TagItems>, v) => {
					if (includes(event?.resource?.tags, v.id))
						acc.push({
							...v,
							color: parseInt(ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex, 10),
							label: v.name,
							customComponent: (
								<Row takeAvailableSpace mainAlignment="flex-start">
									<Row takeAvailableSpace mainAlignment="space-between">
										<Row mainAlignment="flex-end">
											<Padding right="small">
												<Icon icon="Tag" color={ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex} />
											</Padding>
										</Row>
										<Row takeAvailableSpace mainAlignment="flex-start">
											<Text>{v.name}</Text>
										</Row>
									</Row>
								</Row>
							)
						});
					return acc;
				},
				[]
			),
		[event?.resource?.tags, tags]
	);

	return eventDiff <= 30 ? (
		<Row takeAvailableSpace mainAlignment="flex-start" wrap="nowrap">
			{!event?.resource?.calendar?.owner &&
				!event?.resource?.iAmOrganizer &&
				event.resource?.participationStatus === 'NE' && (
					<Tooltip placement="top" label={t('event.action.needs_action', 'Needs action')}>
						<Row style={{ padding: 'none' }} mainAlignment="center">
							<Padding right="small">
								<NeedActionIcon icon="CalendarWarning" color="primary" />
							</Padding>
						</Row>
					</Tooltip>
				)}
			<Tooltip label={title} placement="top" disabled={event.resource.class === 'PRI'}>
				<Row takeAvailableSpace mainAlignment="flex-start" wrap="nowrap">
					<Text color="currentColor" weight="medium" style={{ overflow: 'visible' }}>
						{`${moment(event.start).format('LT')} -`}
					</Text>
					<Padding left="small" />
					<Text overflow="ellipsis" color="currentColor" weight="bold" size="small">
						{title}
					</Text>
				</Row>
			</Tooltip>
			{/* {event?.resource?.isException && (
				<Padding left="small">
					<Icon
						data-testid="ExceptionIcon"
						icon="RepeatException"
						color={event.resource.calendar.color.color}
					/>
				</Padding>
			)} */}
			{showTagIcon && (
				<Tooltip placement="top" label={tagName}>
					<Row style={{ padding: 'none' }} mainAlignment="center">
						<Icon data-testid="TagIcon" icon={tagIcon} color={tagIconColor} />
					</Row>
				</Tooltip>
			)}
			{showMultiTagIcon && (
				<Dropdown items={tagsDropdownItems} forceOpen={showDropdown} onClose={onDropdownClose}>
					<Padding left="small">
						<Icon data-testid="TagIcon" icon={tagIcon} onClick={onIconClick} color={tagIconColor} />
					</Padding>
				</Dropdown>
			)}
		</Row>
	) : (
		<Row takeAvailableSpace mainAlignment="flex-start" wrap="nowrap">
			<Row mainAlignment="space-between" takeAvailableSpace>
				{!event?.resource?.calendar?.owner &&
					!event?.resource?.iAmOrganizer &&
					event.resource?.participationStatus === 'NE' && (
						<Tooltip placement="top" label={t('event.action.needs_action', 'Needs action')}>
							<Row style={{ padding: 'none' }} mainAlignment="center">
								<Padding right="small">
									<NeedActionIcon icon="CalendarWarning" color="primary" />
								</Padding>
							</Row>
						</Tooltip>
					)}
				<Tooltip label={title} placement="top" disabled={event.resource.class === 'PRI'}>
					<Row takeAvailableSpace mainAlignment="flex-start">
						{!event.allDay && (
							<Text overflow="ellipsis" color="currentColor" weight="medium">
								{`${moment(event.start).format('LT')} - ${moment(event.end).format('LT')}`}
							</Text>
						)}
					</Row>
				</Tooltip>
			</Row>
			<Tooltip label={title} placement="top">
				<Row>
					{event.allDay && (
						<Padding left="small">
							<Text overflow="break-word" color="currentColor" weight="bold">
								{title}
							</Text>
						</Padding>
					)}
				</Row>
			</Tooltip>
			{/* {event?.resource?.isException && (
				<Padding left="small">
					<Icon
						data-testid="ExceptionIcon"
						icon="RepeatException"
						color={event.resource.calendar.color.color}
					/>
				</Padding>
			)} */}
			{showTagIcon && (
				<Tooltip placement="top" label={tagName}>
					<Row style={{ padding: 'none' }} mainAlignment="center">
						<Icon data-testid="TagIcon" icon={tagIcon} color={tagIconColor} />
					</Row>
				</Tooltip>
			)}
			{showMultiTagIcon && (
				<Dropdown items={tagsDropdownItems} forceOpen={showDropdown} onClose={onDropdownClose}>
					<Padding left="small">
						<Icon data-testid="TagIcon" icon={tagIcon} onClick={onIconClick} color={tagIconColor} />
					</Padding>
				</Dropdown>
			)}
		</Row>
	);
};
