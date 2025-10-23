/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Input } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

export const CalendarNameInput = ({
	value,
	setValue
}: {
	value: string;
	setValue: (value: string) => void;
}): React.JSX.Element => (
	<Input
		label={t('label.type_name_here', 'Calendar name')}
		backgroundColor="gray5"
		value={value}
		onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
			setValue(e.target.value);
		}}
	/>
);
