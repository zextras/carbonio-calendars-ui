/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ReactElement } from 'react';

export type TagType = {
	item: {
		customComponent?: ReactElement;
		active?: boolean;
		color?: number;
		divider?: boolean;
		id: string;
		label?: string;
		name?: string;
		open?: boolean;
		keepOpen?: boolean;
		CustomComponent?: ReactElement;
		items: Array<TagType>;
	};
};
