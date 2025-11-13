/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import {
	Container,
	Row,
	Avatar,
	Icon,
	Text,
	Padding,
	Tooltip
} from '@zextras/carbonio-design-system';
import { useHistoryNavigation, useSortedTagsArray } from '@zextras/carbonio-ui-commons';
import { includes, filter } from 'lodash';
import { useTranslation } from 'react-i18next';

import { openAppointment } from '../../actions/appointment-actions-fn';
import { PANEL_VIEW } from '../../constants';
import { PARTICIPATION_STATUS } from '../../constants/api';
import { getInvite } from '../../store/actions/get-invite';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { selectInstanceInvite } from '../../store/selectors/invites';
import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';
import { useGetDateRangeConvertedToTimezone } from 'hooks/use-get-date-range-converted-to-timezone';
import { ActionsContext } from 'types/actions';
import { EventType } from 'types/event';

const SearchListItem = ({ item }: { item: EventType }): any => {
	const [t] = useTranslation();
	const dispatch = useAppDispatch();
	const invite = useAppSelector(selectInstanceInvite(item?.resource?.inviteId));
	const timeString = useGetDateRangeConvertedToTimezone(item.start ?? 0, item.end ?? 0);
	const sortedTagsFromStore = useSortedTagsArray();
	const { replaceHistory } = useHistoryNavigation();

	const hasAttachments = useMemo(() => item.resource?.flags?.includes('a'), [item.resource?.flags]);

	const showPtstIcon = useMemo(
		() =>
			item.resource?.participationStatus === PARTICIPATION_STATUS.TENTATIVE ||
			item.resource?.participationStatus === PARTICIPATION_STATUS.DECLINED ||
			item.resource?.participationStatus === PARTICIPATION_STATUS.ACCEPTED,
		[item.resource?.participationStatus]
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

	// this is needed to understand if the icons and location can use more space or not and allow code to chose between this style or takeAvailableSpace
	const iconsStyle = useMemo(
		() =>
			hasAttachments ||
			item.resource?.class === 'PRI' ||
			item.resource?.location ||
			item?.resource?.isRecurrent
				? { minWidth: '3.125rem', flexBasis: 'content', flexGrow: 1 }
				: undefined,
		[hasAttachments, item.resource?.class, item.resource?.isRecurrent, item.resource?.location]
	);

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

	const organizerLabel = item.resource?.organizer?.name || item.resource?.organizer?.email;

	const onClick = useCallback(
		(ev: React.MouseEvent) => {
			const open = openAppointment({
				event: item,
				context: { panelView: PANEL_VIEW.SEARCH, replaceHistory } as ActionsContext
			});
			if (!invite) {
				dispatch(getInvite({ inviteId: item.resource.inviteId })).then(() => {
					open(ev);
				});
			} else {
				open(ev);
			}
		},
		[dispatch, invite, item, replaceHistory]
	);

	return (
		<Container wrap="nowrap" style={{ cursor: 'default' }} onClick={onClick}>
			<Row
				wrap="nowrap"
				width="fill"
				mainAlignment="flex-start"
				padding={{ all: 'small', right: 'large' }}
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
				<Container
					style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: ' ellipsis' }}
					mainAlignment="space-around"
				>
					<Row width="fill" wrap="nowrap">
						{timeString && (
							<>
								<Padding left="small" />
								<Row
									wrap="nowrap"
									style={{ minWidth: '3.125rem', flexBasis: 'content', flexGrow: 1 }}
									mainAlignment="flex-start"
								>
									<Tooltip label={timeString} maxWidth="100%">
										<Text size="small">{timeString}</Text>
									</Tooltip>
								</Row>
							</>
						)}
						<Row
							wrap="nowrap"
							style={iconsStyle}
							mainAlignment="flex-end"
							takeAvailableSpace={!iconsStyle}
						>
							{item.resource?.isRecurrent && (
								<>
									<Padding left="small" />
									<Row mainAlignment="flex-end">
										<Tooltip label={t('label.recurrent', 'Recurrent appointment')}>
											<div>
												<Icon icon="Repeat" size="medium" color="gray0" />
											</div>
										</Tooltip>
									</Row>
								</>
							)}
							{matchTags && (
								<Padding left="small">
									<Icon icon={tagIcon} color={tagIconColor} />
								</Padding>
							)}
							{hasAttachments && (
								<>
									<Padding left="small" />
									<Row mainAlignment="flex-end">
										<Tooltip label={t('has_attachments', 'Has attachments')}>
											<div>
												<Icon icon="AttachOutline" size="medium" color="gray0" />
											</div>
										</Tooltip>
									</Row>
								</>
							)}
							{item.resource?.class === 'PRI' && (
								<>
									<Padding left="small" />
									<Row mainAlignment="flex-end">
										<Tooltip label={t('is_private', 'Is private')}>
											<div>
												<Icon icon="Lock" size="medium" color="gray0" />
											</div>
										</Tooltip>
									</Row>
								</>
							)}
							{item.resource?.location && (
								<>
									<Padding left="small" />
									<Tooltip label={item.resource?.location} maxWidth="100%">
										<Text size="small" color="secondary">
											{item.resource?.location}
										</Text>
									</Tooltip>
								</>
							)}
						</Row>
						{item.resource.calendar.color?.label && (
							<>
								<Padding left="small" />
								<Row mainAlignment="flex-end">
									<Icon
										icon="Calendar2"
										size="medium"
										color={item.resource.calendar.color?.label}
									/>
								</Row>
							</>
						)}
					</Row>
					<Row width="fill" wrap="nowrap">
						{item.title && (
							<>
								<Padding left="small" />
								<Row
									style={{ minWidth: '3.125rem', flexBasis: 'content', flexGrow: 1 }}
									mainAlignment="flex-start"
								>
									<Tooltip label={item.title} maxWidth="100%">
										<Text size="small">{item.title}</Text>
									</Tooltip>
								</Row>
							</>
						)}
						{item.resource?.organizer?.name && (
							<>
								<Padding left="small" />
								<Row
									style={{ minWidth: '3.125rem', flexBasis: 'content', flexGrow: 1 }}
									mainAlignment="flex-end"
								>
									<Tooltip
										label={`${t('search.organized_by', 'organized by')} ${
											item.resource?.organizer?.name
										}`}
										maxWidth="100%"
									>
										<Text size="small" color="secondary">
											{t('search.organized_by', 'organized by')} {item.resource?.organizer?.name}
										</Text>
									</Tooltip>
								</Row>
							</>
						)}
						{showPtstIcon && (
							<>
								<Padding left="small" />
								<Row mainAlignment="flex-end">
									<Icon icon={icon} color={color} size="medium" />
								</Row>
							</>
						)}
					</Row>
				</Container>
			</Row>
		</Container>
	);
};

export default SearchListItem;
