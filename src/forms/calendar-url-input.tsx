/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Input } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { InputType } from './types';

export const URLInput = ({ value, onChange }: InputType<string>): React.JSX.Element => (
	<Input
		label={t('label.url', 'URL')}
		backgroundColor="gray5"
		value={value}
		onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
			onChange(e.target.value);
		}}
	/>
);
