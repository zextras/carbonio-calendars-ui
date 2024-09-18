/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useEffect, useMemo } from 'react';

import {
	Container,
	Button,
	IconButton,
	ButtonProps,
	pseudoClasses,
	Tooltip,
	Padding
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled, { css, SimpleInterpolation } from 'styled-components';

import { CalendarView, useAppStatusStore } from '../../store/zustand/store';

const ButtonWrapper = styled.div`
	min-width: fit-content;
	border: 0.0625rem solid;
	${({ color = 'primary', theme }): SimpleInterpolation => css`
		${pseudoClasses(theme, color, 'border-color')};
	`};
	&:last-child {
		border-left: none;
		border-radius: 0 0.125rem 0.125rem 0;
	}
	&:first-child {
		border-right: none;
		border-radius: 0.125rem 0 0 0.125rem;
	}
	&:not(:first-child):not(:last-child) {
		border-radius: 0;
		border-right: none;
		border-left: none;
	}
`;

const CustomButton: FC<ButtonProps> = (props: ButtonProps): ReactElement => (
	<ButtonWrapper>
		<Button {...props} style={{ border: 0 }} />
	</ButtonWrapper>
);

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
	const today = useCallback(() => onNavigate('TODAY'), [onNavigate]);
	const next = useCallback(() => onNavigate('NEXT'), [onNavigate]);
	const prev = useCallback(() => onNavigate('PREV'), [onNavigate]);

	const calendarViewCallback = (calendarView:CalendarView) => ():void => {
		useAppStatusStore.setState({ calendarView });
		onView(calendarView);
	}

	const week = useCallback(calendarViewCallback('week'), [onView]);
	const day = useCallback(calendarViewCallback('day'), [onView]);
	const month = useCallback(calendarViewCallback('month'), [onView]);
	const workView = useCallback(calendarViewCallback('work_week'), [onView]);

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

	useEffect(calendarViewCallback(view), [view, onView])

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
					<CustomButton
						backgroundColor={view === 'month' ? 'highlight' : undefined}
						label={t('label.month', 'month')}
						type="outlined"
						onClick={month}
						data-testid="MonthButton"
					/>
					<CustomButton
						backgroundColor={view === 'week' ? 'highlight' : undefined}
						label={t('label.week', 'week')}
						type="outlined"
						onClick={week}
						data-testid="WeekButton"
					/>
					<CustomButton
						backgroundColor={view === 'day' ? 'highlight' : undefined}
						label={t('label.day', 'day')}
						type="outlined"
						onClick={day}
						data-testid="DayButton"
					/>
					<CustomButton
						backgroundColor={view === 'work_week' ? 'highlight' : undefined}
						label={t('label.work_week', 'work week')}
						type="outlined"
						onClick={workView}
						data-testid="WorkWeekButton"
					/>
				</Container>
			</Container>
		</Container>
	);
};
