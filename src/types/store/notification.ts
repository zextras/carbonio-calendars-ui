/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type NotifictionOptionsType = {
	body: string;
	vibrate: Array<string>;
	icon: string;
	dir: string;
};

export type ShowNotificationType = {
	title: string;
	body: string;
	icon: string | undefined;
};
