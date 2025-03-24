/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Dispatch, ReactElement, SetStateAction } from 'react';

import { Icon, Row, Tooltip } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

const AlignedIcon = styled(Icon)`
	position: relative;
	top: -0.0625rem;
`;

export const CustomEventIcon = ({
	isIconVisible,
	tooltipLabel,
	iconColor,
	iconName,
	disableOuterTooltip
}: {
	isIconVisible: boolean;
	tooltipLabel: string;
	iconColor?: string;
	iconName: string;
	disableOuterTooltip: Dispatch<SetStateAction<boolean>>;
}): ReactElement | null =>
	isIconVisible ? (
		<Tooltip label={tooltipLabel} placement="top">
			<Row
				padding={{ right: 'extrasmall' }}
				onMouseEnter={(): void => disableOuterTooltip(true)}
				onMouseLeave={(): void => disableOuterTooltip(false)}
				onFocus={(): void => disableOuterTooltip(true)}
				onBlur={(): void => disableOuterTooltip(false)}
			>
				<AlignedIcon color={iconColor} icon={iconName} style={{ minWidth: '1rem' }} />
			</Row>
		</Tooltip>
	) : null;
