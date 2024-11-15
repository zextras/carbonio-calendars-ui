/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

export const Dash = ({ backgroundColor }: { backgroundColor: string }): React.JSX.Element => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			height: '0.5rem'
		}}
	>
		<div
			style={{
				width: '0.5rem',
				height: '0.2rem',
				backgroundColor
			}}
		/>
	</div>
);
