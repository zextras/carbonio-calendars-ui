/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import {
	Container,
	Divider,
	Text,
	Row,
	ButtonProps,
	Button
} from '@zextras/carbonio-design-system';

interface ModalHeaderProps {
	title: string;
	onClose?: ButtonProps['onClick'];
}

export const ModalHeader = ({ title, onClose }: ModalHeaderProps): React.JSX.Element => (
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
				<Button
					size={'medium'}
					onClick={onClose}
					icon="CloseOutline"
					type={'ghost'}
					color={'gray0'}
				/>
			)}
		</Row>
		<Container padding={{ top: 'small', bottom: 'small' }}>
			<Divider />
		</Container>
	</>
);
