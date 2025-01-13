/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

export const emptyCalendarTrashRequest = async (): Promise<any> =>
	soapFetch('EmptyCalendarTrash', {
		_jsns: 'urn:zimbraMail'
	});
