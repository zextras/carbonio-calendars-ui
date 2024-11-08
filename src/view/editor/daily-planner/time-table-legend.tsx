/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container, Padding, useTheme } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { getDefaultLineColors, getEventColor } from './utils';

const Circle = ({
	borderColor,
	backgroundColor
}: {
	borderColor?: string;
	backgroundColor: string;
}): React.JSX.Element => (
	<div
		style={{
			width: '1rem',
			height: '1rem',
			borderRadius: '50%',
			border: borderColor ? `1px solid ${borderColor}` : 'none',
			backgroundColor
		}}
	/>
);

const Dash = ({
	backgroundColor
}: {
	borderColor?: string;
	backgroundColor: string;
}): React.JSX.Element => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			height: '100%'
		}}
	>
		<div
			style={{
				width: '1rem',
				height: '0.2rem',
				backgroundColor
			}}
		/>
	</div>
);

export const TimeTableLegend = (): React.JSX.Element => {
	const theme = useTheme();
	const [t] = useTranslation();
	const defaultLineColors = getDefaultLineColors(theme);

	return (
		<div
			style={{
				width: '100%',
				display: 'flex',
				justifyContent: 'space-between',
				height: '2rem',
				paddingTop: '1rem'
			}}
		>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle backgroundColor={getEventColor('unknown', theme)} />
				</Padding>
				{t('daily_planner.legend.unknown', 'Unknown')}
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle borderColor={'black'} backgroundColor={'white'} />
				</Padding>
				{t('daily_planner.legend.non-working', 'Non-working')}
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle borderColor={'black'} backgroundColor={getEventColor('free', theme)} />
				</Padding>
				{t('daily_planner.legend.free', 'Free')}
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle backgroundColor={getEventColor('busy', theme)} />
				</Padding>
				{t('daily_planner.legend.busy', 'Busy')}
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle backgroundColor={getEventColor('tentative', theme)} />
				</Padding>
				{t('daily_planner.legend.tentative', 'Tentative')}
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle backgroundColor={getEventColor('out-of-office', theme)} />
				</Padding>
				{t('daily_planner.legend.out-of-office', 'Out of office')}
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Dash backgroundColor={defaultLineColors.start} />
				</Padding>
				{t('daily_planner.legend.start_time', 'Start time')}
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Dash backgroundColor={defaultLineColors.end} />
				</Padding>
				{t('daily_planner.legend.end_time', 'End time')}
			</Container>
		</div>
	);
};
