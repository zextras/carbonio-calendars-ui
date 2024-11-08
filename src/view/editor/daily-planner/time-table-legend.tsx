/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container, Padding, useTheme, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { Circle } from './parts/circle';
import { Dash } from './parts/dash';
import { getDefaultLineColors, getEventColor } from './utils';

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
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle backgroundColor={getEventColor('unknown', theme)} borderColor="black" />
				</Padding>
				<Text size="extrasmall">{t('daily_planner.legend.unknown', 'Unknown')}</Text>
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle borderColor={'black'} backgroundColor={'white'} />
				</Padding>
				<Text size="extrasmall">{t('daily_planner.legend.non-working', 'Non-working')}</Text>
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle borderColor={'black'} backgroundColor={getEventColor('free', theme)} />
				</Padding>
				<Text size="extrasmall">{t('daily_planner.legend.free', 'Free')}</Text>
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle backgroundColor={getEventColor('busy', theme)} />
				</Padding>
				<Text size="extrasmall">{t('daily_planner.legend.busy', 'Busy')}</Text>
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle backgroundColor={getEventColor('tentative', theme)} />
				</Padding>
				<Text size="extrasmall">{t('daily_planner.legend.tentative', 'Tentative')}</Text>
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle backgroundColor={getEventColor('out-of-office', theme)} />
				</Padding>
				<Text size="extrasmall">{t('daily_planner.legend.out-of-office', 'Out of office')}</Text>
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Dash backgroundColor={defaultLineColors.start} />
				</Padding>
				<Text size="extrasmall">{t('daily_planner.legend.start_time', 'Start time')}</Text>
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Dash backgroundColor={defaultLineColors.end} />
				</Padding>
				<Text size="extrasmall">{t('daily_planner.legend.end_time', 'End time')}</Text>
			</Container>
		</div>
	);
};
