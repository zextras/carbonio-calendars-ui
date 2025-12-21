/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Icon, Row, Text } from '@zextras/carbonio-design-system';

export const NeverSentWarningRow = ({
	neverSent,
	label
}: {
	neverSent: boolean;
	label: string;
}): ReactElement => (
	<>
		{neverSent && (
			<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
				<Row padding={{ right: 'small' }}>
					<Icon color="error" icon="AlertCircleOutline" />
				</Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text color="error" overflow="break-word">
						{label}
					</Text>
				</Row>
			</Row>
		)}
	</>
);
