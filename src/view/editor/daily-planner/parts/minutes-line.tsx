/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Tooltip } from '@zextras/carbonio-design-system';

import { calculatePosition } from '../utils';

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
}): React.JSX.Element => (
	<Tooltip label={tooltipLabel}>
		<div
			data-testid={dataTestId}
			style={{
				width,
				backgroundColor: color,
				height: '2rem',
				borderRadius: 'none',
				float: 'left',
				position: 'absolute',
				left: calculatePosition(atPosition)
			}}
		/>
	</Tooltip>
);
