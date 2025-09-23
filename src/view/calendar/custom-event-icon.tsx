/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import styled from '@emotion/styled';
import { Icon, Row, Tooltip } from '@zextras/carbonio-design-system';

const AlignedIcon = styled(Icon)`
	position: relative;
	top: -0.0625rem;
`;

export const CustomEventIcon = ({
	isIconVisible,
	tooltipLabel,
	iconColor,
	iconName
}: {
	isIconVisible: boolean;
	tooltipLabel: string;
	iconColor?: string;
	iconName: string;
}): ReactElement | null =>
	isIconVisible ? (
		<Tooltip label={tooltipLabel} placement="top">
			<Row padding={{ right: 'extrasmall' }}>
				<AlignedIcon color={iconColor} icon={iconName} style={{ minWidth: '1rem' }} />
			</Row>
		</Tooltip>
	) : null;
