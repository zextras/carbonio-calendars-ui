/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-shell-ui';
import { BaseFolder } from '@zextras/carbonio-ui-soap-lib';

export type RequestFolder = Pick<
	BaseFolder,
	'name' | 'view' | 'color' | 'f' | 'l' | 'rgb' | 'url' | 'acl'
> & {
	fie?: 0 | 1; // If set, the server will fetch the folder if it already exists rather than throwing mail.ALREADY_EXISTS
	sync?: 0 | 1; // If set (default) then if "url" is set, synchronize folder content on folder creation
};

export type CreateFolderRequest = {
	folder: RequestFolder;
	_jsns: typeof JSNS.mail;
};

export type CreateFolderResponse = {
	folder: BaseFolder[];
	_jsns: typeof JSNS.mail;
};
