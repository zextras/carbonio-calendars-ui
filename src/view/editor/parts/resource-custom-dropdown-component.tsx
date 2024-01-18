/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Icon, Padding, Row, Text, Tooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

export const ResourceCustomDropdownComponent = ({ label = '' }: { label: string }): JSX.Element => {
	const [t] = useTranslation();
	return (
		<Container width="fit" mainAlignment="flex-start" orientation="horizontal">
			<Padding right={'small'}>
				<Text weight={'regular'}>{label}</Text>
			</Padding>
			<Tooltip
				label={t(
					'attendee_equipment_unavailable',
					'Equipment not available at the selected time of the event'
				)}
			>
				<Row>
					<Icon icon="AlertTriangle" color="error" />
				</Row>
			</Tooltip>
		</Container>
	);
};
