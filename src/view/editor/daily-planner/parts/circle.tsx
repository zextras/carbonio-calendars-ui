/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

export const Circle = ({
	borderColor,
	backgroundColor
}: {
	borderColor?: string;
	backgroundColor: string;
}): React.JSX.Element => (
	<div
		style={{
			width: '0.5rem',
			height: '0.5rem',
			borderRadius: '50%',
			border: borderColor ? `1px solid ${borderColor}` : 'none',
			backgroundColor
		}}
	/>
);
