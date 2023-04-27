/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { SyntheticEvent } from 'react';

export type ActionItem = {
	onClick: (ev?: Event) => void;
	icon: string;
	id: string;
	items?: Array<{
		onClick?: (ev?: Event) => void;
		disabled?: boolean;
		icon?: string;
		id?: string;
		label?: string;
	}>;
	label: string;
};
export type ActionItemDD = {
	onClick: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent) => void;
	icon: string;
	id: string;
	items: Array<{
		onClick: (e: SyntheticEvent<HTMLElement, Event> | KeyboardEvent) => void;
		disabled: boolean;
		icon: string;
		id: string;
		label: string;
	}>;
	label: string;
};

export type GetActionReturnTypeDD = Array<ActionItemDD>;

export type GetActionReturnType = Array<ActionItem>;
