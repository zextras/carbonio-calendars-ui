/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ForwardedRef, ReactNode, useMemo } from 'react';

import { Container, Tooltip, useTheme } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { EVENT_DISPLAY_STATUS } from '../../constants/api';
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
		const [t] = useTranslation();

		const outerContainerBackgroundColor = useMemo(() => {
			const startingLineHeight = 8;
			const endLineHeight = 10;
			if (freeBusyActual === EVENT_DISPLAY_STATUS.FREE) {
				return theme.palette.white.regular;
			}
			if (freeBusyActual === EVENT_DISPLAY_STATUS.BUSY) {
				return color;
			}
			if (freeBusyActual === EVENT_DISPLAY_STATUS.OUT_OF_OFFICE) {
				return theme.palette.gray2.regular;
			}
			if (freeBusyActual === EVENT_DISPLAY_STATUS.TENTATIVE) {
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

		const tooltipLabel = useMemo(() => {
			if (freeBusyActual === EVENT_DISPLAY_STATUS.FREE) {
				return t('tooltip.free_appointment', 'Free appointment');
			}
			if (freeBusyActual === EVENT_DISPLAY_STATUS.BUSY) {
				return t('tooltip.busy_appointment', 'Busy appointment');
			}
			if (freeBusyActual === EVENT_DISPLAY_STATUS.OUT_OF_OFFICE) {
				return t('tooltip.out_of_office_appointment', 'Out of office appointment');
			}
			if (freeBusyActual === EVENT_DISPLAY_STATUS.TENTATIVE) {
				return t('tooltip.tentative_appointment', 'Tentative appointment');
			}
			return color;
		}, [color, freeBusyActual, t]);

		return (
			<Tooltip label={tooltipLabel}>
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
			</Tooltip>
		);
	}
);
CustomEventFreeBusyStatus.displayName = 'CustomEventFreeBusyStatus';
