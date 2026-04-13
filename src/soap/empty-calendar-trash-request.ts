/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { publishQuotaChangedEventUnconditional } from '../event-bus/quota-changed';

export const emptyCalendarTrashRequest = async (): Promise<any> =>
	legacySoapFetch<any, any>('EmptyCalendarTrash', {
		_jsns: 'urn:zimbraMail'
	})
		.then((response) => {
			if ('Fault' in response) {
				throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
			}
			publishQuotaChangedEventUnconditional();
			return response;
		})
		.catch((error) => {
			throw new Error(error);
		});
