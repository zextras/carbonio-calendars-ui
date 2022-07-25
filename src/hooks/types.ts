/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type ACTION = {
	click: (ev?: MouseEvent) => void;
	icon: string;
	id: string;
	items: Array<{
		click: (ev?: MouseEvent) => void;
		disabled: boolean;
		icon: string;
		id: string;
		keepOpen: boolean;
		label: string;
	}>;
	label: string;
};
export type GetActionReturnType = Array<ACTION>;
