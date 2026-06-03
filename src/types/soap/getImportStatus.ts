/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-shell-ui';

export type GetImportStatusRequest = {
	_jsns: typeof JSNS.mail;
};

export type ImportStatusEntry = {
	/** Datasource ID */
	id: string;
	/** Whether the import is still running */
	isRunning: boolean;
	/** Whether the last completed import was successful */
	success?: boolean;
	/** Error message if the import failed */
	error?: string;
};

export type GetImportStatusResponse = {
	_jsns: typeof JSNS.mail;
	caldav?: ImportStatusEntry[];
};
