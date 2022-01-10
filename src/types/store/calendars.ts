/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ZimbraColor } from '../../commons/zimbra-standard-colors';

export type Calendar = {
	checked: boolean;
	freeBusy: boolean;
	color: ZimbraColor;
	id: string;
	rid?: string;
	name: string;
	parent: string;
	owner: string;
	deletable: boolean;
	absFolderPath: string;
	appointments: { ids: Array<string> };
	icon: string;
	zid: string;
	acl: any;
	isShared?: boolean;
};
