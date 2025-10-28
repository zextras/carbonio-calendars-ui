/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ErrorSoapBodyResponse } from '@zextras/carbonio-ui-soap-lib';

export function isSuccess<X extends object>(res: ErrorSoapBodyResponse | X): res is X {
	return !('Fault' in res);
}
