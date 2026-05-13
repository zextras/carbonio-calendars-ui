/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';

import { Divider, Icon, Row, Text, Tooltip } from '@zextras/carbonio-design-system';
import {
	ZIMBRA_STANDARD_COLORS,
	useSortedTagsArray,
	Tag,
	useFoldersMap
} from '@zextras/carbonio-ui-commons';
import { reduce, includes } from 'lodash';
import { useTranslation } from 'react-i18next';

import { isExternalSyncFolder } from 'commons/utilities';
import { PARTICIPATION_STATUS } from 'constants/api';
import { EventType } from 'types/event';

export const TitleRow = ({ event }: { event: EventType }): ReactElement => {
	const [t] = useTranslation();
	const folders = useFoldersMap();
	const folder = folders[event.resource.calendar.id];
	const eventIsFromExternalCalendar = isExternalSyncFolder(folder ?? {});
	const tags = useSortedTagsArray();
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
	const title = useMemo(() => {
		if (event.resource.class === 'PRI') {
			return event.title || t('label.private', 'Private');
		}
		return event.title;
	}, [event, t]);

	const showNeedActionIcon =
		event.haveWriteAccess &&
		event.resource.iAmAttendee &&
		!event.resource.calendar?.owner &&
		!event?.resource?.iAmOrganizer &&
		event.resource?.participationStatus === PARTICIPATION_STATUS.NEED_ACTION;

	return (
		<>
			<Row width="fill" padding={{ bottom: 'small' }}>
				{event.resource.class === 'PRI' && (
					<Row padding={{ all: 'small' }}>
						<Icon
							color={event.resource.calendar.color.color}
							icon="LockOutline"
							style={{ minWidth: '1rem' }}
						/>
					</Row>
				)}
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="large" weight="bold">
						{title}
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
						{showNeedActionIcon && (
							<Row>
								<Icon icon="CalendarWarning" color="primary" />
							</Row>
						)}
						{eventIsFromExternalCalendar && (
							<Tooltip
								label={t(
									'label.external_calendar_event',
									'Event from an ICS calendar added from URL'
								)}
								placement="top"
							>
								<Row padding={{ right: 'small' }}>
									<Icon color="0" icon="Link2" />
								</Row>
							</Tooltip>
						)}
					</>
				)}
			</Row>
			<Divider />
		</>
	);
};
