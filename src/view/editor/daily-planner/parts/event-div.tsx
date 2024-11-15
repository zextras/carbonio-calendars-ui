/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Tooltip } from '@zextras/carbonio-design-system';

import { calculateEventWidth, calculatePosition } from '../utils';

export const EventDiv = ({
	startPosition,
	eventTimeSpan,
	color,
	dataTestId,
	tooltipLabel
}: {
	startPosition: number;
	eventTimeSpan: number;
	color: string;
	dataTestId?: string;
	tooltipLabel: string;
}): React.JSX.Element => (
	<Tooltip label={tooltipLabel} placement={'top'}>
		<div
			data-testid={dataTestId}
			style={{
				width: calculateEventWidth(eventTimeSpan),
				backgroundColor: color,
				height: '2rem',
				float: 'left',
				position: 'absolute',
				left: calculatePosition(startPosition)
			}}
		/>
	</Tooltip>
);
