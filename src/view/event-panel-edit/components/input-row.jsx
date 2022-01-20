/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { Row, Input } from '@zextras/carbonio-design-system';

export default function InputRow({ onChange, label, defaultValue, disabled }) {
	return (
		<Row height="fit" width="fill" padding={{ top: 'large' }}>
			<Input
				backgroundColor="gray5"
				label={label}
				defaultValue={defaultValue}
				onChange={onChange}
				disabled={disabled}
			/>
		</Row>
	);
}
