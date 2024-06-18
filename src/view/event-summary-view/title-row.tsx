/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Divider, Icon, Row, Text, Tooltip } from '@zextras/carbonio-design-system';
import { Tag, useTags, ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-shell-ui';
import { reduce, includes } from 'lodash';
import { useTranslation } from 'react-i18next';

import { EventType } from '../../types/event';

export const TitleRow = ({ event }: { event: EventType }): ReactElement => {
	const [t] = useTranslation();
	const tags = useTags();
	const tagItems = useMemo(
		() =>
			reduce(
				tags,
				(acc, v) => {
					if (includes(event?.resource?.tags, v.id))
						acc.push({
							...v,
							color: parseInt(ZIMBRA_STANDARD_COLORS[v?.color ?? 0].hex, 10)
						});
					return acc;
				},
				[] as Array<Tag>
			),
		[event?.resource?.tags, tags]
	);
	const tagIcon = useMemo(() => (tagItems?.length > 1 ? 'TagsMoreOutline' : 'Tag'), [tagItems]);
	const tagIconColor = useMemo(
		() => (tagItems?.length === 1 ? tagItems?.[0]?.color : undefined),
		[tagItems]
	);
	return (
		<>
			<Row width="fill" padding={{ bottom: 'small' }}>
				{event.resource.class === 'PRI' && (
					<Row padding={{ all: 'small' }}>
						<Icon
							customColor={event.resource.calendar.color.color}
							icon="LockOutline"
							style={{ minWidth: '1rem' }}
						/>
					</Row>
				)}
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="large" weight="bold">
						{event.resource.class === 'PRI' ? 'Private' : event.title}
					</Text>
				</Row>
				{event.resource.class !== 'PRI' && (
					<>
						{event?.resource?.isRecurrent && (
							<Tooltip label={t('label.recurrent', 'Recurrent appointment')} placement="top">
								<Row padding={{ right: 'small' }}>
									<Icon color="0" icon="Repeat" />
								</Row>
							</Tooltip>
						)}
						<Row padding={{ right: 'small' }}>
							{event?.resource?.tags?.length > 0 && (
								<Icon color={tagIconColor ? `${tagIconColor}` : '0'} icon={tagIcon} />
							)}
						</Row>
						<Row>{event?.resource?.flags?.includes('a') && <Icon icon="AttachOutline" />}</Row>
						{!event.resource.calendar?.owner && !event?.resource?.iAmOrganizer && (
							<Row>
								{event.resource?.participationStatus === 'NE' && (
									<Icon icon="CalendarWarning" color="primary" />
								)}
							</Row>
						)}
					</>
				)}
			</Row>
			<Divider />
		</>
	);
};
