/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-shell-ui';

export type ImportDataRequest = {
	_jsns: typeof JSNS.mail;
	caldav: {
		id: string;
	};
};

export type ImportDataResponse = {
	_jsns: typeof JSNS.mail;
};
