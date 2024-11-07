/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container, Padding, useTheme } from '@zextras/carbonio-design-system';

import { getEventColor } from './utils';

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

export const TimeTableLegend = (): React.JSX.Element => {
	const theme = useTheme();
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
				Unknown
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle borderColor={'black'} backgroundColor={'white'} />
				</Padding>
				Non-working
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle borderColor={'black'} backgroundColor={getEventColor('free', theme)} />
				</Padding>
				Free
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle backgroundColor={getEventColor('busy', theme)} />
				</Padding>
				Busy
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle backgroundColor={getEventColor('tentative', theme)} />
				</Padding>
				Tentative
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle backgroundColor={getEventColor('out-of-office', theme)} />
				</Padding>
				Out of office
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle borderColor={'black'} backgroundColor={'white'} />
				</Padding>
				Start time
			</Container>
			<Container width={'fit'} mainAlignment={'flex-start'} orientation={'horizontal'}>
				<Padding all={'small'}>
					<Circle borderColor={'black'} backgroundColor={'white'} />
				</Padding>
				End time
			</Container>
		</div>
	);
};
