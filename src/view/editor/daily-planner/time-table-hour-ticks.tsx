/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { useTheme } from '@zextras/carbonio-design-system';

import { MinutesLine } from './parts/minutes-line';

export const TimeTableHourTicks = (): React.JSX.Element => {
	const theme = useTheme();
	const color = theme.palette.gray2.regular;
	const hourTicks = Array.from(
		{ length: 25 },
		(_, hour): React.JSX.Element => (
			<MinutesLine key={`${hour}`} $width={'1px'} $atPosition={60 * hour} $color={color} />
		)
	);
	return <>{hourTicks}</>;
};
