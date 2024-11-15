/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { useTheme } from '@zextras/carbonio-design-system';

export const Circle = ({ backgroundColor }: { backgroundColor: string }): React.JSX.Element => {
	const theme = useTheme();
	return (
		<div
			style={{
				width: '0.5rem',
				height: '0.5rem',
				borderRadius: '50%',
				border: `1px solid ${theme.palette.gray1.regular}`,
				backgroundColor
			}}
		/>
	);
};
