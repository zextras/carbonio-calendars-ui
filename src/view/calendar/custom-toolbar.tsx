/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Container, ButtonOld as Button, IconButton } from '@zextras/carbonio-design-system';
import { useAppStatusStore } from '../../store/zustand/store';

const MultiButton = styled(Button)`
	&:last-child {
		border-left: none;
		border-radius: 0 2px 2px 0;
	}
	&:first-child {
		border-right: none;
		border-radius: 2px 0 0 2px;
	}
	&:not(:first-child):not(:last-child) {
		border-radius: 0;
		border-right: none;
		border-left: none;
	}
`;

export interface CustomToolbarProps {
	label: string;
	onView: (arg: string) => void;
	onNavigate: (arg: string) => void;
	view: string;
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

	return (
		<Container width="fill" height="fit" padding={{ bottom: 'small' }}>
			<Container
				orientation="horizontal"
				width="fill"
				height={48}
				mainAlignment="baseline"
				crossAlignment="stretch"
				background="gray5"
				padding={{ horizontal: 'small' }}
			>
				<Container width="fit" orientation="horizontal" mainAlignment="flex-start">
					<Button label={t('label.today', 'today')} type="outlined" onClick={today} />
				</Container>
				<Container orientation="horizontal" width="100%">
					<IconButton iconColor="primary" icon="ChevronLeft" onClick={prev} />
					<Button type="ghost" label={label} onClick={(): null => null} minWidth="250px" />
					<IconButton iconColor="primary" icon="ChevronRight" onClick={next} />
				</Container>
				<Container width="fit" orientation="horizontal" mainAlignment="flex-end">
					<MultiButton
						backgroundColor={view === 'month' ? 'highlight' : null}
						label={t('label.month', 'month')}
						type="outlined"
						onClick={month}
					/>
					<MultiButton
						backgroundColor={view === 'week' ? 'highlight' : null}
						label={t('label.week', 'week')}
						type="outlined"
						onClick={week}
					/>
					<MultiButton
						backgroundColor={view === 'day' ? 'highlight' : null}
						label={t('label.day', 'day')}
						type="outlined"
						onClick={day}
					/>
					<MultiButton
						backgroundColor={view === 'work_week' ? 'highlight' : null}
						label={t('label.work_week', 'work week')}
						type="outlined"
						onClick={workView}
					/>
				</Container>
			</Container>
		</Container>
	);
};
