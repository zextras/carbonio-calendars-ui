/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { JSNS } from '@zextras/carbonio-shell-ui';

export type ImportAppointmentsRequest = {
	_jsns: typeof JSNS.mail;
	ct: string;
	l: string;
	content: {
		mid?: string;
		part?: string;
		aid?: string;
		_content?: string;
	};
};

export type ImportAppointmentsResponse = {
	_jsns: typeof JSNS.mail;
	appt?: Array<{ n?: number; ids?: string }>;
};
