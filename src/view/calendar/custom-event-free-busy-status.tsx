/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ForwardedRef, ReactNode, useMemo } from 'react';

import { Container, useTheme } from '@zextras/carbonio-design-system';

import type { InviteFreeBusy } from '../../types/store/invite';

export const CustomEventFreeBusyStatus = React.forwardRef(
	(
		{
			children,
			freeBusyActual,
			color,
			background
		}: {
			children?: ReactNode;
			color: string;
			background: string;
			freeBusyActual?: InviteFreeBusy;
		},
		ref: ForwardedRef<HTMLDivElement>
	): React.JSX.Element => {
		const theme = useTheme();

		const outerContainerBackgroundColor = useMemo(() => {
			const startingLineHeight = 8;
			const endLineHeight = 10;
			if (freeBusyActual === 'F') {
				return theme.palette.white.regular;
			}
			if (freeBusyActual === 'B') {
				return color;
			}
			if (freeBusyActual === 'O') {
				return theme.palette.gray2.regular;
			}
			if (freeBusyActual === 'T') {
				return `repeating-linear-gradient(45deg,
				${color},
				${color} ${startingLineHeight}px,
				${background},
				${background} ${endLineHeight}px)`;
			}
			return color;
		}, [
			background,
			color,
			freeBusyActual,
			theme.palette.gray2.regular,
			theme.palette.white.regular
		]);

		return (
			<Container
				height="100%"
				data-testid="calendar-event"
				ref={ref}
				style={{
					paddingLeft: '0.5rem',
					background: outerContainerBackgroundColor,
					borderRadius: '0.25rem',
					boxShadow: '0 0 0.875rem -0.5rem rgba(0, 0, 0, 0.5)',
					border: `0.0625rem solid ${color}`,
					transition: 'border 0.15s ease-in-out, background 0.15s ease-in-out',
					cursor: 'pointer',
					color
				}}
			>
				{children}
			</Container>
		);
	}
);
CustomEventFreeBusyStatus.displayName = 'CustomEventFreeBusyStatus';
