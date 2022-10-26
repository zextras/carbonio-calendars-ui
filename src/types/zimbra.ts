/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export type ZimbraFolder = {
	f: any;
	broken?: boolean;
	folder: ZimbraFolder;
	color: any;
	id: string;
	n: number;
	name: string;
	l: string;
	owner?: any;
	rgb?: any;
	rid?: string;
	appt: { ids: Array<string> };
	deletable: boolean;
	absFolderPath: string;
	zid: string;
	acl: any;
	isShared?: boolean;
	perm?: string;
	haveWriteAccess?: boolean;
};
