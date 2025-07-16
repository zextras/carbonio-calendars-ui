/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

export const emptyCalendarTrashRequest = async (): Promise<any> =>
	legacySoapFetch('EmptyCalendarTrash', {
		_jsns: 'urn:zimbraMail'
	});
