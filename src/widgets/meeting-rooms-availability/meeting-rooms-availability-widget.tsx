/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import styled from '@emotion/styled';
import { Button, Container, Text } from '@zextras/carbonio-design-system';
import { addDays, format, isSameHour, isToday, subDays } from 'date-fns';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { getRoomEmails, useRoomsAvailability } from './use-rooms-availability';
import {
	getCenteredScrollLeft,
	getDayHours,
	getSlotStatus,
	type MeetingRoomsAvailabilityConfig,
	type SlotStatus
} from './utils';
import { getTimeOnlyToken, useIs24HourFormat } from '../../commons/time-format';
import type { WidgetProps } from '../../types/dashboard-widget';

const SLOT_WIDTH_REM = 4;
const ROOM_COLUMN_WIDTH_REM = 8;
const ROW_HEIGHT_REM = 2.5;

const Scroller = styled.div`
	flex: 1;
	min-height: 0;
	overflow: auto;
	position: relative;
`;

const Grid = styled.div<{ $slots: number }>`
	display: grid;
	grid-template-columns: ${ROOM_COLUMN_WIDTH_REM}rem repeat(
			${({ $slots }): number => $slots},
			${SLOT_WIDTH_REM}rem
		);
	width: max-content;
`;

const StickyCell = styled.div<{ $header?: boolean }>`
	position: sticky;
	left: 0;
	z-index: 2;
	display: flex;
	align-items: center;
	height: ${ROW_HEIGHT_REM}rem;
	padding: 0 0.5rem;
	box-sizing: border-box;
	overflow: hidden;
	background: ${({ theme }): string => theme.palette.gray6.regular};
	border-right: 1px solid ${({ theme }): string => theme.palette.gray3.regular};
	border-bottom: 1px solid ${({ theme }): string => theme.palette.gray3.regular};
	${({ $header }): string => ($header ? 'top: 0; z-index: 4;' : '')}
`;

const HeaderCell = styled.div<{ $current: boolean }>`
	position: sticky;
	top: 0;
	z-index: 3;
	display: flex;
	align-items: center;
	justify-content: center;
	height: ${ROW_HEIGHT_REM}rem;
	box-sizing: border-box;
	background: ${({ theme, $current }): string =>
		$current ? theme.palette.highlight.regular : theme.palette.gray6.regular};
	border-bottom: 1px solid ${({ theme }): string => theme.palette.gray3.regular};
	border-left: 1px solid ${({ theme }): string => theme.palette.gray3.regular};
`;

const STATUS_PALETTE: Record<SlotStatus, 'success' | 'error' | 'warning' | 'gray2' | 'gray3'> = {
	free: 'success',
	busy: 'error',
	tentative: 'warning',
	unavailable: 'gray2',
	unknown: 'gray3'
};

const SlotCell = styled.div<{ $status: SlotStatus; $current: boolean }>`
	height: ${ROW_HEIGHT_REM}rem;
	box-sizing: border-box;
	border-left: 1px solid ${({ theme }): string => theme.palette.gray3.regular};
	border-bottom: 1px solid ${({ theme }): string => theme.palette.gray3.regular};
	background: ${({ theme, $status }): string => theme.palette[STATUS_PALETTE[$status]].regular};
	opacity: ${({ $status, $current }): number => ($status === 'free' && !$current ? 0.35 : 0.9)};
`;

export const MeetingRoomsAvailabilityWidget = ({
	config
}: WidgetProps<MeetingRoomsAvailabilityConfig>): React.JSX.Element => {
	const [t] = useTranslation();
	const is24h = useIs24HourFormat();
	const [day, setDay] = useState(() => new Date());
	const scrollerRef = useRef<HTMLDivElement>(null);
	const emails = useMemo(() => getRoomEmails(config.rooms), [config.rooms]);
	const { byEmail, error } = useRoomsAvailability(emails, day);
	const hours = useMemo(() => getDayHours(day), [day]);
	const hasRooms = config.rooms.length > 0;

	const onPrevious = useCallback(() => setDay((d) => subDays(d, 1)), []);
	const onNext = useCallback(() => setDay((d) => addDays(d, 1)), []);
	const onToday = useCallback(() => setDay(new Date()), []);

	// center the grid on the current hour, once, when the grid is first shown
	useLayoutEffect(() => {
		const scroller = scrollerRef.current;
		if (!scroller) return;
		const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
		const now = new Date();
		const index = Math.max(
			0,
			hours.findIndex((hour) => isSameHour(hour, now))
		);
		scroller.scrollLeft = getCenteredScrollLeft({
			index,
			slotWidth: SLOT_WIDTH_REM * rem,
			viewportWidth: scroller.clientWidth - ROOM_COLUMN_WIDTH_REM * rem
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasRooms]);

	const dayLabel = format(day, 'PPPP');
	const hourToken = getTimeOnlyToken(is24h);

	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="stretch"
			data-testid="meeting-rooms-widget"
		>
			<Container
				orientation="horizontal"
				height="fit"
				mainAlignment="space-between"
				padding={{ vertical: 'small', horizontal: 'medium' }}
				gap="0.5rem"
			>
				<Button
					type="ghost"
					color="secondary"
					icon="ChevronLeft"
					size="small"
					onClick={onPrevious}
					aria-label={t('label.previous_day', 'Previous day')}
					data-testid="meeting-rooms-previous-day"
				/>
				<Container height="fit" crossAlignment="center">
					<Text weight="bold" overflow="ellipsis" data-testid="meeting-rooms-day">
						{dayLabel}
					</Text>
					{!isToday(day) && (
						<Button type="ghost" size="small" label={t('label.today', 'Today')} onClick={onToday} />
					)}
				</Container>
				<Button
					type="ghost"
					color="secondary"
					icon="ChevronRight"
					size="small"
					onClick={onNext}
					aria-label={t('label.next_day', 'Next day')}
					data-testid="meeting-rooms-next-day"
				/>
			</Container>
			{!hasRooms ? (
				<Container data-testid="meeting-rooms-empty">
					<Text color="secondary">
						{t(
							'widget.meeting_rooms_availability.empty',
							'No meeting rooms selected. Choose them in the widget settings.'
						)}
					</Text>
				</Container>
			) : (
				<>
					{error && (
						<Text color="error" size="small" style={{ padding: '0 1rem' }}>
							{t('label.error_try_again', 'Something went wrong, please try again')}
						</Text>
					)}
					<Scroller ref={scrollerRef} data-testid="meeting-rooms-scroller">
						<Grid $slots={hours.length}>
							<StickyCell $header />
							{map(hours, (hour) => (
								<HeaderCell key={hour.getTime()} $current={isSameHour(hour, new Date())}>
									<Text size="extrasmall" weight="bold">
										{format(hour, hourToken)}
									</Text>
								</HeaderCell>
							))}
							{map(config.rooms, (room) => (
								<React.Fragment key={room.email}>
									<StickyCell title={room.label}>
										<Text size="small" overflow="ellipsis">
											{room.label}
										</Text>
									</StickyCell>
									{map(hours, (hour) => {
										const status = getSlotStatus(byEmail?.[room.email], hour);
										return (
											<SlotCell
												key={hour.getTime()}
												$status={byEmail ? status : 'unknown'}
												$current={isSameHour(hour, new Date())}
												data-testid={`slot-${room.email}-${hour.getHours()}`}
												data-status={byEmail ? status : 'unknown'}
											/>
										);
									})}
								</React.Fragment>
							))}
						</Grid>
					</Scroller>
				</>
			)}
		</Container>
	);
};
