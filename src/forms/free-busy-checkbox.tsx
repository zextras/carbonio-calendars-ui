/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Checkbox } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

export const FreeBusyCheckbox = ({
	value,
	onClick
}: {
	value: boolean;
	onClick: () => void;
}): React.JSX.Element => (
	<Checkbox
		value={value}
		onClick={onClick}
		label={t('label.exclude_free_busy', 'Exclude this calendar when reporting the free/busy times')}
	/>
);
