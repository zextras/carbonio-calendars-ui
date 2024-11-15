/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container, Padding, useTheme, Text } from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DAILY_PLANNER_EVENT_TYPE } from './constants';
import { Circle } from './parts/circle';
import { Dash } from './parts/dash';
import { getDefaultLineColors, getEventColor, getEventLabel } from './utils';

export const TimeTableLegend = (): React.JSX.Element => {
	const theme = useTheme();
	const [t] = useTranslation();
	const defaultLineColors = getDefaultLineColors(theme);

	return (
		<div
			style={{
				width: '100%',
				display: 'flex',
				justifyContent: 'flex-start',
				flexWrap: 'wrap',
				paddingTop: '1rem'
			}}
		>
			{map(DAILY_PLANNER_EVENT_TYPE, (event) => (
				<Container
					width={'fit'}
					mainAlignment={'flex-start'}
					orientation={'horizontal'}
					key={event}
				>
					<Padding all={'small'}>
						<Circle backgroundColor={getEventColor(event, theme)} />
					</Padding>
					<Text size="extrasmall">{getEventLabel(event, t)}</Text>
				</Container>
			))}
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Dash backgroundColor={defaultLineColors.start} />
				</Padding>
				<Text size="extrasmall">{t('daily_planner.start_time', 'Start time')}</Text>
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Dash backgroundColor={defaultLineColors.end} />
				</Padding>
				<Text size="extrasmall">{t('daily_planner.end_time', 'End time')}</Text>
			</Container>
		</div>
	);
};
