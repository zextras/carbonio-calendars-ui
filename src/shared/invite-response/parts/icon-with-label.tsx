/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement } from 'react';

import { Row, Icon, Tooltip } from '@zextras/carbonio-design-system';

interface IconWithLabelProps {
	icon: string;
	tooltipLabel: string;
	children: ReactElement;
	paddingTop?: string;
}

export const IconWithLabel: FC<IconWithLabelProps> = ({
	icon,
	tooltipLabel,
	children,
	paddingTop = 'large'
}) => (
	<Row width="fill" mainAlignment="flex-start" padding={{ top: paddingTop }}>
		<Tooltip placement="left" label={tooltipLabel}>
			<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
				<Icon size="large" icon={icon} />
			</Row>
		</Tooltip>
		<Row takeAvailableSpace mainAlignment="flex-start">
			{children}
		</Row>
	</Row>
);
