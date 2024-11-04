/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { calculatePosition } from '../utils';

export const HourLabel = ({
	label,
	atPosition
}: {
	atPosition: number;
	label: string;
}): React.JSX.Element => (
	<Container
		style={{
			width: '3px',
			height: '2rem',
			borderRadius: 'none',
			float: 'left',
			position: 'absolute',
			left: calculatePosition(atPosition)
		}}
	>
		{label}
	</Container>
);
