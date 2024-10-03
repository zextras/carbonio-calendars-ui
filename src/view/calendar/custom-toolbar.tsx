/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useEffect, useMemo } from 'react';

import {
	Container,
	Button,
	IconButton,
	pseudoClasses,
	Tooltip,
	Padding,
	useTheme
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled, { css, SimpleInterpolation } from 'styled-components';

import { useSplitCalendarsViewPrefs } from '../../hooks/use-split-calendars-view-prefs';
import { CalendarView, useAppStatusStore } from '../../store/zustand/store';

const CustomContainer = styled(Container)`
	border: 0.0625rem solid;
	height: fit-content;
	${({ color = 'primary', theme }): SimpleInterpolation => css`
		${pseudoClasses(theme, color, 'border-color')};
	`};
`;

const CustomButton = styled(Button)`
	border-radius: 0;
`;

export interface CustomToolbarProps {
	label: string;
	onView: (arg: CalendarView) => void;
	onNavigate: (arg: string) => void;
	view: CalendarView;
}

export const CustomToolbar = ({
	label,
	onView,
	onNavigate,
	view
}: CustomToolbarProps): ReactElement => {
	const [t] = useTranslation();
	const [prefSplitCalendarsViewEnabled, setPrefSplitCalendarsViewEnabled] =
		useSplitCalendarsViewPrefs();

	const theme = useTheme();

	const today = useCallback(() => onNavigate('TODAY'), [onNavigate]);
	const next = useCallback(() => onNavigate('NEXT'), [onNavigate]);
	const prev = useCallback(() => onNavigate('PREV'), [onNavigate]);
	const week = useCallback(() => {
		useAppStatusStore.setState({ calendarView: 'week' });
		return onView('week');
	}, [onView]);
	const day = useCallback(() => {
		useAppStatusStore.setState({ calendarView: 'day' });
		return onView('day');
	}, [onView]);
	const month = useCallback(() => {
		useAppStatusStore.setState({ calendarView: 'month' });
		return onView('month');
	}, [onView]);
	const workView = useCallback(() => {
		useAppStatusStore.setState({ calendarView: 'work_week' });
		return onView('work_week');
	}, [onView]);

	const leftClickLabel = useMemo(() => {
		if (view === 'month') {
			return t('previous_month', 'Previous month');
		}
		if (view === 'week' || view === 'work_week') {
			return t('previous_week', 'Previous week');
		}
		return t('previous_day', 'Previous day');
	}, [t, view]);

	const rightClickLabel = useMemo(() => {
		if (view === 'month') {
			return t('next_month', 'Next month');
		}
		if (view === 'week' || view === 'work_week') {
			return t('next_week', 'Next week');
		}
		return t('next_day', 'Next day');
	}, [t, view]);

	const calendarsSplitViewTooltip = useMemo(
		() =>
			prefSplitCalendarsViewEnabled
				? t('label.disableCalendarsSplitViewTooltip', 'Disabled calendars split view')
				: t('label.enableCalendarsSplitViewTooltip', 'Enable calendars split view'),
		[prefSplitCalendarsViewEnabled, t]
	);

	const isCalendarsSplitViewDisabled = view !== 'day';

	const calendarsSplitViewButtonColor = useMemo(
		() =>
			prefSplitCalendarsViewEnabled && !isCalendarsSplitViewDisabled ? 'highlight' : undefined,
		[isCalendarsSplitViewDisabled, prefSplitCalendarsViewEnabled]
	);

	const onCalendarsSplitViewButtonClick = useCallback(() => {
		setPrefSplitCalendarsViewEnabled((prevValue) => !prevValue);
	}, [setPrefSplitCalendarsViewEnabled]);

	useEffect(() => {
		useAppStatusStore.setState({ calendarView: view });
		onView(view);
	});
	return (
		<Container width="fill" height="fit" padding={{ bottom: 'small' }}>
			<Container
				data-testid="CalendarToolbar"
				orientation="horizontal"
				width="fill"
				height="3rem"
				mainAlignment="flex-start"
				background={'gray5'}
				padding={{ horizontal: 'small' }}
			>
				<Container width="max-content" orientation="horizontal" mainAlignment="flex-start">
					<Button
						label={t('label.today', 'today')}
						type="outlined"
						onClick={today}
						minWidth={'fit-content'}
					/>
					<Padding left={'1rem'} />
					<Tooltip label={leftClickLabel}>
						<IconButton
							iconColor="primary"
							icon="ChevronLeft"
							onClick={prev}
							minWidth={'max-content'}
						/>
					</Tooltip>
					<Padding horizontal={'.25rem'} />
					<Tooltip label={rightClickLabel}>
						<IconButton
							iconColor="primary"
							icon="ChevronRight"
							onClick={next}
							minWidth={'max-content'}
						/>
					</Tooltip>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="flex-start"
					style={{ minWidth: 0, flexBasis: 'content', flexGrow: 1 }}
				>
					<Padding left={'1rem'} />
					<Button
						type="ghost"
						label={label}
						onClick={(): null => null}
						data-testid="CurrentDateContainer"
					/>
				</Container>
				<Container width="fit" orientation="horizontal" mainAlignment="flex-end">
					<Padding right={'large'}>
						<Tooltip label={calendarsSplitViewTooltip} disabled={isCalendarsSplitViewDisabled}>
							<Button
								type="outlined"
								icon={'WeekViewOutline'}
								backgroundColor={calendarsSplitViewButtonColor}
								disabled={isCalendarsSplitViewDisabled}
								onClick={onCalendarsSplitViewButtonClick}
							/>
						</Tooltip>
					</Padding>

					<CustomContainer width="fit" orientation="horizontal" mainAlignment="flex-end">
						<CustomButton
							backgroundColor={view === 'month' ? 'highlight' : undefined}
							label={t('label.month', 'month')}
							type="ghost"
							onClick={month}
							data-testid="MonthButton"
							minWidth={'fit-content'}
						/>
						<CustomButton
							backgroundColor={view === 'week' ? 'highlight' : undefined}
							label={t('label.week', 'week')}
							type="ghost"
							onClick={week}
							data-testid="WeekButton"
							minWidth={'fit-content'}
						/>
						<CustomButton
							backgroundColor={view === 'day' ? 'highlight' : undefined}
							label={t('label.day', 'day')}
							type="ghost"
							onClick={day}
							data-testid="DayButton"
							minWidth={'fit-content'}
						/>
						<CustomButton
							backgroundColor={view === 'work_week' ? 'highlight' : undefined}
							label={t('label.work_week', 'work week')}
							type="ghost"
							onClick={workView}
							data-testid="WorkWeekButton"
							minWidth={'fit-content'}
						/>
					</CustomContainer>
				</Container>
			</Container>
		</Container>
	);
};
