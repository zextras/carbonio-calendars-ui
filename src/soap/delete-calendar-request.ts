/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { FolderAction } from '../types/soap/soap-actions';

export const deleteCalendarRequest = async (action: FolderAction): Promise<any> =>
	legacySoapFetch<any, any>('DeleteCalendar', {
		action,
		_jsns: JSNS.mail
	})
		.then((response) => {
			if ('Fault' in response) {
				throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
			}
			return response;
		})
		.catch((error) => {
			throw new Error(error);
		});
