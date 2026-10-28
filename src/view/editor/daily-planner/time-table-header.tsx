/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { HourLabel } from './parts/hour-label';
import { useIs24HourFormat } from '../../../commons/time-format';

const HOURS_12H = [
	'12',
	...Array.from({ length: 12 }, (_, i) => (i + 1).toString()),
	...Array.from({ length: 12 }, (_, i) => (i + 1).toString())
];
const HOURS_24H = Array.from({ length: 25 }, (_, i) => i.toString());

export const TimetableHeader = (): React.JSX.Element => {
	const is24h = useIs24HourFormat();
	const hours = is24h ? HOURS_24H : HOURS_12H;
	return (
		<div style={{ width: '100%', position: 'relative', height: '2rem' }}>
			{hours.map((label, hour) => {
				const key = `${label}-${hour}`;
				return <HourLabel key={key} label={label} atPosition={60 * hour} />;
			})}
		</div>
	);
};
