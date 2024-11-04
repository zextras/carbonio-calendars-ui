/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { calculatePosition } from '../utils';

export const MinutesLine = ({
	atPosition,
	color,
	width = '3px'
}: {
	atPosition: number;
	color: string;
	width?: string;
}): React.JSX.Element => (
	<div
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
);
