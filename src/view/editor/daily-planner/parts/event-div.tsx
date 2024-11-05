/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { calculateEventWidth, calculatePosition } from '../utils';

export const EventDiv = ({
	startPosition,
	eventTimeSpan,
	color
}: {
	startPosition: number;
	eventTimeSpan: number;
	color: string;
}): React.JSX.Element => (
	<div
		style={{
			width: calculateEventWidth(eventTimeSpan),
			backgroundColor: color,
			height: '2rem',
			// borderRadius: 'none',
			float: 'left',
			position: 'absolute',
			left: calculatePosition(startPosition)
		}}
	/>
);
