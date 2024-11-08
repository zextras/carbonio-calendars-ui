/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

export const Dash = ({
	backgroundColor
}: {
	borderColor?: string;
	backgroundColor: string;
}): React.JSX.Element => (
	<div
		style={{
			display: 'flex',
			alignItems: 'center',
			height: '100%'
		}}
	>
		<div
			style={{
				width: '1rem',
				height: '0.2rem',
				backgroundColor
			}}
		/>
	</div>
);
