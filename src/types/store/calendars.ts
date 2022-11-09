/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ZimbraColorType } from '../../commons/zimbra-standard-colors';

export type Calendar = {
	checked: boolean;
	broken: boolean;
	freeBusy: boolean;
	color: ZimbraColorType;
	id: string;
	rid?: string;
	n: number;
	name: string;
	parent?: string;
	owner?: string;
	deletable: boolean;
	absFolderPath?: string;
	zid?: string;
	acl: any;
	isShared?: boolean;
	perm?: string;
	haveWriteAccess: boolean;
};
