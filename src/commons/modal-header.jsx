/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container, Divider, Text, Row, IconButton } from '@zextras/carbonio-design-system';

export const ModalHeader = ({ title, onClose }) => (
	<>
		<Row
			orientation="horizontal"
			mainAlignment="space-between"
			takeAvailableSpace
			wrap="nowrap"
			width="100%"
		>
			<Text weight="bold" size="large">
				{title}
			</Text>
			{onClose && (
				<IconButton
					size="medium"
					style={{ padding: { all: 'small' }, margin: 0 }}
					onClick={onClose}
					icon="CloseOutline"
				/>
			)}
		</Row>
		<Container padding={{ top: 'small', bottom: 'small' }}>
			<Divider />
		</Container>
	</>
);
