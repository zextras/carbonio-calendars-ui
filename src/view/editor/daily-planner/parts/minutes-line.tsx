/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Tooltip } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

import { calculatePosition } from '../utils';

const MinutesLineDiv = styled.div.attrs(
	({ width, color, left }: { width: string; color: string; left: string }) => ({
		width,
		color,
		left
	})
)`
	width: ${(props): string => props.width};
	background-color: ${(props): string => props.color};
	height: 2rem;
	border-radius: none;
	float: left;
	position: absolute;
	left: ${(props): string => props.left};
`;

export const MinutesLine = ({
	atPosition,
	color,
	width = '3px',
	tooltipLabel,
	dataTestId
}: {
	atPosition: number;
	color: string;
	width?: string;
	tooltipLabel?: string;
	dataTestId?: string;
}): React.JSX.Element =>
	tooltipLabel ? (
		<Tooltip label={tooltipLabel}>
			<MinutesLineDiv
				data-testid={dataTestId}
				width={width}
				color={color}
				left={calculatePosition(atPosition)}
			/>
		</Tooltip>
	) : (
		<MinutesLineDiv
			data-testid={dataTestId}
			width={width}
			color={color}
			left={calculatePosition(atPosition)}
		/>
	);
