/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Container, Row, Avatar, Icon, Text, Tooltip } from '@zextras/carbonio-design-system';
import {
	useHistoryNavigation,
	useSortedTagsArray,
	useFoldersMap
} from '@zextras/carbonio-ui-commons';
import { includes, filter } from 'lodash';
import { useTranslation } from 'react-i18next';

import { openAppointment } from 'actions/appointment-actions-fn';
import { isExternalSyncFolder } from 'commons/utilities';
import { PARTICIPATION_STATUS } from 'constants/api';
import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';
import { PANEL_VIEW } from 'constants/index';
import { useGetDateRangeConvertedToTimezone } from 'hooks/use-get-date-range-converted-to-timezone';
import { getInvite } from 'store/actions/get-invite';
import { useAppDispatch, useAppSelector } from 'store/redux/hooks';
import { selectInstanceInvite } from 'store/selectors/invites';
import { ActionsContext } from 'types/actions';
import { EventType } from 'types/event';

const SearchListItem = ({ item }: { item: EventType }): React.ReactElement => {
	const [t] = useTranslation();

	const isPrivateLabel = t('is_private', 'Is private');
	const isRecurrentLabel = t('label.recurrent', 'Recurrent appointment');
	const hasAttachmentsLabel = t('has_attachments', 'Has attachments');
	const organizerLabel = item.resource?.organizer?.name ?? item.resource?.organizer?.email;
	const organizedByLabel = `${t('search.organized_by', 'organized by')} ${organizerLabel}`;

	const dispatch = useAppDispatch();
	const folders = useFoldersMap();
	const folder = folders[item.resource.calendar.id];
	const isExternalCalendar = isExternalSyncFolder(folder ?? {});
	const invite = useAppSelector(selectInstanceInvite(item?.resource?.inviteId));
	const timeString = useGetDateRangeConvertedToTimezone(item.start ?? 0, item.end ?? 0);
	const sortedTagsFromStore = useSortedTagsArray();
	const { replaceHistory } = useHistoryNavigation();

	const hasAttachments = useMemo(() => item.resource?.flags?.includes('a'), [item.resource?.flags]);

	const showPtstIcon = useMemo(
		() =>
			!isExternalCalendar &&
			(item.resource?.participationStatus === PARTICIPATION_STATUS.TENTATIVE ||
				item.resource?.participationStatus === PARTICIPATION_STATUS.DECLINED ||
				item.resource?.participationStatus === PARTICIPATION_STATUS.ACCEPTED),
		[item.resource?.participationStatus, isExternalCalendar]
	);

	const [color, icon] = useMemo(() => {
		if (item.resource?.participationStatus === PARTICIPATION_STATUS.TENTATIVE) {
			return ['warning', 'QuestionMarkOutline'];
		}
		if (item.resource?.participationStatus === PARTICIPATION_STATUS.DECLINED) {
			return ['error', 'CloseOutline'];
		}
		return ['success', 'CheckmarkOutline'];
	}, [item.resource?.participationStatus]);

	const matchTags = useMemo(
		() => filter(sortedTagsFromStore, (tag) => includes(item?.resource?.tags, tag.id)),
		[item?.resource?.tags, sortedTagsFromStore]
	);

	const tagIcon = useMemo(() => (matchTags?.length > 1 ? 'TagsMoreOutline' : 'Tag'), [matchTags]);

	const tagIconColor = useMemo(
		() =>
			CALENDARS_STANDARD_COLORS[
				matchTags?.length === 1 && matchTags[0].color ? matchTags[0].color : 0
			].color,
		[matchTags]
	);

	const onClick = useCallback(() => {
		const open = openAppointment({
			event: item,
			context: { panelView: PANEL_VIEW.SEARCH, replaceHistory } as ActionsContext
		});
		if (!invite) {
			dispatch(getInvite({ inviteId: item.resource.inviteId })).then(() => {
				open();
			});
		} else {
			open();
		}
	}, [dispatch, invite, item, replaceHistory]);

	return (
		<Container
			orientation="horizontal"
			width="fill"
			style={{ cursor: 'default' }}
			onClick={onClick}
			padding={{ all: 'small' }}
		>
			{organizerLabel && (
				<Avatar
					data-testid="avatarAppointment"
					selecting={false}
					selected={false}
					label={organizerLabel}
					size="large"
				/>
			)}
			<Row takeAvailableSpace wrap="nowrap" height="100%">
				<Container orientation="vertical" width="fill" padding={{ left: 'large' }}>
					<Row takeAvailableSpace wrap="nowrap" width="100%" height="100%" gap="8px">
						{timeString && (
							<Row
								takeAvailableSpace
								wrap="nowrap"
								width="100%"
								style={{ flexDirection: 'column', alignItems: 'flex-start' }}
							>
								<Tooltip label={timeString} overflowTooltip>
									<Text size="small" overflow="ellipsis">
										{timeString}
									</Text>
								</Tooltip>
							</Row>
						)}
						<Row>
							<Container orientation="horizontal" mainAlignment="flex-end">
								{item.resource?.isRecurrent && (
									<Tooltip label={isRecurrentLabel}>
										<Icon icon="Repeat" size="medium" color="gray0" />
									</Tooltip>
								)}
								{matchTags && <Icon icon={tagIcon} color={tagIconColor} />}
								{hasAttachments && (
									<Tooltip label={hasAttachmentsLabel}>
										<Icon icon="AttachOutline" size="medium" color="gray0" />
									</Tooltip>
								)}
								{item.resource?.class === 'PRI' && (
									<Tooltip label={isPrivateLabel}>
										<Icon icon="Lock" size="medium" color="gray0" />
									</Tooltip>
								)}
								{item.resource?.location && (
									<Tooltip label={item.resource?.location}>
										<Text size="small" color="secondary" overflow="ellipsis">
											{item.resource?.location}
										</Text>
									</Tooltip>
								)}
								{item.resource.calendar.color?.label && (
									<Icon
										icon="Calendar2"
										size="medium"
										color={item.resource.calendar.color?.label}
									/>
								)}
							</Container>
						</Row>
					</Row>
					<Row takeAvailableSpace wrap="nowrap" width="100%" height="100%" gap="8px">
						{item.title && (
							<Row
								takeAvailableSpace
								wrap="nowrap"
								width="100%"
								style={{ flexDirection: 'column', alignItems: 'flex-start' }}
							>
								<Tooltip label={item.title} overflowTooltip>
									<Text size="small" overflow="ellipsis">
										{item.title}
									</Text>
								</Tooltip>
							</Row>
						)}
						{organizedByLabel && (
							<Row
								takeAvailableSpace
								wrap="nowrap"
								width="100%"
								style={{ flexDirection: 'column', alignItems: 'flex-end' }}
							>
								<Tooltip label={organizedByLabel} overflowTooltip>
									<Text size="small" overflow="ellipsis">
										{organizedByLabel}
									</Text>
								</Tooltip>
							</Row>
						)}
						{showPtstIcon && (
							<Row>
								<Container orientation="horizontal" mainAlignment="flex-end">
									<Icon icon={icon} color={color} size="medium" />
								</Container>
							</Row>
						)}
					</Row>
				</Container>
			</Row>
		</Container>
	);
};

export default SearchListItem;
