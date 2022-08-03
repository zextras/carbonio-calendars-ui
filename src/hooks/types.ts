/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SyntheticEvent } from 'react';

export type Action = {
	click: (ev?: SyntheticEvent<HTMLElement, Event> | KeyboardEvent) => void;
	icon: string;
	id: string;
	items: Array<{
		click: (ev?: SyntheticEvent<HTMLElement, Event> | KeyboardEvent) => void;
		disabled: boolean;
		icon: string;
		id: string;
		keepOpen: boolean;
		label: string;
	}>;
	label: string;
};
export type GetActionReturnType = Array<Action>;
