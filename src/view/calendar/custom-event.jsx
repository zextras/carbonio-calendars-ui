/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
	Container,
	Text,
	Icon,
	Row,
	Tooltip,
	Dropdown,
	ModalManagerContext,
	SnackbarManagerContext,
	Padding
} from '@zextras/carbonio-design-system';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { replaceHistory, useTags, ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-shell-ui';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { reduce, includes } from 'lodash';
import { useEventActions } from '../../hooks/use-event-actions';
import { createAndApplyTag, useTagExist } from '../tags/tag-actions';

const NeedActionIcon = styled(Icon)`
	position: relative;
	top: -1px;
`;
export default function CustomEvent({ event, title }) {
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const createModal = useContext(ModalManagerContext);
	const createSnackbar = useContext(SnackbarManagerContext);
	const tags = useTags();

	const actions = useEventActions(
		event,
		{ replaceHistory, dispatch, createModal, createSnackbar, tags, createAndApplyTag },
		t
	);
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
				(acc, v) => {
					if (includes(event?.resource?.tags, v.id))
						acc.push({ ...v, color: ZIMBRA_STANDARD_COLORS[parseInt(v.color ?? '0', 10)].hex });
					return acc;
				},
				[]
			),
		[event?.resource?.tags, tags]
	);
	const tagIcon = useMemo(() => (tagItems?.length > 1 ? 'TagsMoreOutline' : 'Tag'), [tagItems]);
	const tagIconColor = useMemo(
		() => (tagItems?.length === 1 ? tagItems?.[0]?.color : undefined),
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
				(acc, v) => {
					if (includes(event?.resource?.tags, v.id))
						acc.push({
							...v,
							color: ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex,
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

	return (
		<>
			<Dropdown
				contextMenu
				width="cal(min(100%,200px))"
				style={{ width: '100%', height: '100%' }}
				items={actions}
				display="block"
			>
				<Container
					width="fill"
					height="fit"
					background="transparent"
					mainAlignment="center"
					crossAlignment="center"
					style={{ position: 'relative' }}
				>
					<Container
						orientation="horizontal"
						width="fill"
						height="fit"
						crossAlignment="center"
						mainAlignment="flex-start"
					>
						{eventDiff <= 30 ? (
							<Row takeAvailableSpace mainAlignment="flex-start" wrap="no-wrap">
								<Tooltip label={title} placement="top">
									<Row takeAvailableSpace mainAlignment="flex-start" wrap="no-wrap">
										<Text color="currentColor" weight="medium" style={{ overflow: 'visible' }}>
											{`${moment(event.start).format('LT')} -`}
										</Text>
										<Padding left="small" />
										<Text overflow="ellipsis" color="currentColor" weight="bold" size="small">
											{title}
										</Text>
									</Row>
								</Tooltip>
								{!event?.resource?.calendar?.owner &&
									!event?.resource?.iAmOrganizer &&
									event.resource?.participationStatus === 'NE' && (
										<Tooltip placement="top" label={t('event.action.needs_action', 'Needs action')}>
											<Row style={{ padding: 'none' }} mainAlignment="center">
												<NeedActionIcon icon="CalendarWarning" color="primary" />
											</Row>
										</Tooltip>
									)}
								{showTagIcon && (
									<Tooltip placement="top" label={tagName}>
										<Row style={{ padding: 'none' }} mainAlignment="center">
											<Icon data-testid="TagIcon" icon={tagIcon} color={tagIconColor} />
										</Row>
									</Tooltip>
								)}
								{showMultiTagIcon && (
									<Dropdown
										items={tagsDropdownItems}
										forceOpen={showDropdown}
										onClose={onDropdownClose}
									>
										<Padding left="small">
											<Icon
												data-testid="TagIcon"
												icon={tagIcon}
												onClick={onIconClick}
												color={tagIconColor}
											/>
										</Padding>
									</Dropdown>
								)}
							</Row>
						) : (
							<Row takeAvailableSpace mainAlignment="flex-start" wrap="no-wrap">
								<Row mainAlignment="space-between" takeAvailableSpace>
									<Tooltip label={title} placement="top">
										<Row takeAvailableSpace mainAlignment="flex-start">
											{!event.allDay && (
												<Text overflow="ellipsis" color="currentColor" weight="medium">
													{`${moment(event.start).format('LT')} - ${moment(event.end).format(
														'LT'
													)}`}
												</Text>
											)}
										</Row>
									</Tooltip>
									{!event?.resource?.calendar?.owner &&
										!event?.resource?.iAmOrganizer &&
										event.resource?.participationStatus === 'NE' && (
											<Tooltip
												placement="top"
												label={t('event.action.needs_action', 'Needs action')}
											>
												<Row style={{ padding: 'none' }} mainAlignment="center">
													<NeedActionIcon icon="CalendarWarning" color="primary" />
												</Row>
											</Tooltip>
										)}
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
								{showTagIcon && (
									<Tooltip placement="top" label={tagName}>
										<Row style={{ padding: 'none' }} mainAlignment="center">
											<Icon data-testid="TagIcon" icon={tagIcon} color={tagIconColor} />
										</Row>
									</Tooltip>
								)}
								{showMultiTagIcon && (
									<Dropdown
										items={tagsDropdownItems}
										forceOpen={showDropdown}
										onClose={onDropdownClose}
									>
										<Padding left="small">
											<Icon
												data-testid="TagIcon"
												icon={tagIcon}
												onClick={onIconClick}
												color={tagIconColor}
											/>
										</Padding>
									</Dropdown>
								)}
							</Row>
						)}
						{event.resource.class === 'PRI' && (
							<Tooltip label={t('label.private', 'Private')} placement="top">
								<Row padding={{ left: 'extrasmall' }}>
									<Icon color="currentColor" icon="Lock" style={{ minWidth: '16px' }} />
								</Row>
							</Tooltip>
						)}
						{event.resource.inviteNeverSent && (
							<Tooltip
								label={t(
									'event.action.invitation_not_sent_yet',
									'The invitation has not been sent yet'
								)}
								placement="bottom"
							>
								<Row padding={{ left: 'extrasmall' }}>
									<Icon color="error" icon="AlertCircleOutline" style={{ minWidth: '16px' }} />
								</Row>
							</Tooltip>
						)}
					</Container>
					{!event.allDay && (
						<Tooltip label={title} placement="top">
							<Container
								orientation="horizontal"
								width="fill"
								crossAlignment="flex-start"
								mainAlignment="flex-start"
							>
								<Text
									overflow="break-word"
									color="currentColor"
									style={{ lineHeight: '1.4em' }}
									weight="bold"
								>
									{title}
								</Text>
							</Container>
						</Tooltip>
					)}
				</Container>
			</Dropdown>
		</>
	);
}
