/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Icon, Row, Text } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import styled from 'styled-components';

const WarningText = styled(Text)`
	color: #d74942;
`;

export const NeverSentWarningRow = ({ neverSent }: { neverSent: boolean }): ReactElement => (
	<>
		{neverSent && (
			<Row width="fill" mainAlignment="flex-start" padding={{ all: 'small' }}>
				<Row padding={{ right: 'small' }}>
					<Icon customColor="#D74942" icon="AlertCircleOutline" />
				</Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<WarningText overflow="break-word">
						{t('label.invitation_not_sent', "You haven't sent the invitation to the attendees yet")}
					</WarningText>
				</Row>
			</Row>
		)}
	</>
);
