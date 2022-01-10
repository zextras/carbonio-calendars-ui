/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Container, Row, Avatar, Icon, Divider, Text, Padding, Tooltip } from '@zextras/zapp-ui';
import { find } from 'lodash';
import styled from 'styled-components';
import { selectCalendars } from '../../store/selectors/calendars';
import { useSearchActionsFn } from './hooks/use-search-actions-fn';

const HoverContainer = styled(Container)`
	&:hover {
		background: ${({ theme, active }) =>
			active ? theme.palette.highlight.hover : theme.palette.gray6.hover};
	}
`;

const SearchListItem = ({ item, active }) => {
	const isShared = item?.resource?.l?.includes(':');
	const calendars = useSelector(selectCalendars);

	const cal = isShared
		? find(calendars, (f) => `${f.zid}:${f.rid}` === item.resource?.l)
		: find(calendars, (f) => f.id === item.resource?.l);
	const [t] = useTranslation();

	const hasAttachments = useMemo(() => item.resource?.flags?.includes('a'), [item.resource?.flags]);
	const showPtstIcon = useMemo(
		() => ['TE', 'DE', 'AC'].includes(item.resource?.ptst),
		[item.resource?.ptst]
	);
	const [color, icon] = useMemo(() => {
		if (item.resource?.ptst === 'TE') {
			return ['warning', 'QuestionMarkCircle'];
		}
		if (item.resource?.ptst === 'DE') {
			return ['error', 'CloseCircle'];
		}
		return ['success', 'CheckmarkCircle2'];
	}, [item.resource?.ptst]);

	const timeString = useMemo(
		() =>
			`${moment.utc(item.resource?.ridZ, 'YYYYMMDD[T]HHmmss[Z]').local()} - ${moment
				.utc(item.resource?.ridZ, 'YYYYMMDD[T]HHmmss[Z]')
				.add(item.resource?.dur)
				.local()
				.format('HH:mm')}`,
		[item.resource?.dur, item.resource?.ridZ]
	);

	// this is needed to understand if the icons and location can use more space or not and allow code to chose between this style or takeAvailableSpace
	const iconsStyle = useMemo(
		() =>
			hasAttachments ||
			item.resource?.class === 'PRI' ||
			item.resource?.location ||
			item?.resource?.isRecurrent
				? { minWidth: '50px', flexBasis: 'content', flexGrow: 1 }
				: undefined,
		[hasAttachments, item.resource?.class, item.resource?.isRecurrent, item.resource?.location]
	);

	const { open } = useSearchActionsFn(item);

	return (
		<HoverContainer
			wrap="nowrap"
			style={{ cursor: 'default' }}
			onClick={open}
			background={active ? 'highlight' : 'gray6'}
			active={active}
		>
			<Row
				wrap="nowrap"
				width="fill"
				mainAlignment="flex-start"
				padding={{ all: 'small', right: 'large' }}
			>
				{item.resource?.organizer?.name && (
					<Avatar
						selecting={false}
						selected={false}
						label={item.resource?.organizer?.name}
						onClick={() => null}
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
									style={{ minWidth: '50px', flexBasis: 'content', flexGrow: 1 }}
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
							{hasAttachments && (
								<>
									<Padding left="small" />
									<Row mainAlignment="flex-end">
										<Tooltip label={t('has_attachments', 'Has attachments')}>
											<div>
												<Icon
													data-testid="AttachmentIcon"
													icon="AttachOutline"
													size="medium"
													color="gray0"
												/>
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
												<Icon data-testid="LockIcon" icon="Lock" size="medium" color="gray0" />
											</div>
										</Tooltip>
									</Row>
								</>
							)}
							{item.resource?.isRecurrent && (
								<>
									<Padding left="small" />
									<Row mainAlignment="flex-end">
										<Tooltip label={t('is_recurrent', 'Is recurrent')}>
											<div>
												<Icon data-testid="Refresh" icon="Refresh" size="medium" color="gray0" />
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
						{cal?.color?.label && (
							<>
								<Padding left="small" />
								<Row mainAlignment="flex-end">
									<Icon
										data-testid="CalendarIcon"
										icon="Calendar2"
										size="medium"
										customColor={cal.color.label}
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
									style={{ minWidth: '50px', flexBasis: 'content', flexGrow: 1 }}
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
									style={{ minWidth: '50px', flexBasis: 'content', flexGrow: 1 }}
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
									<Icon data-testid="AppointmentIcon" icon={icon} color={color} size="medium" />
								</Row>
							</>
						)}
					</Row>
				</Container>
			</Row>
			<Divider />
		</HoverContainer>
	);
};

export default SearchListItem;
