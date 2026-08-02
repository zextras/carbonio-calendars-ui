/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { JSNS } from '@zextras/carbonio-shell-ui';
import { ErrorSoapBodyResponse, legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import {
	ImportAppointmentsRequest,
	ImportAppointmentsResponse
} from 'types/soap/importAppointments';

export type ImportAppointmentsParams = {
	/** Target calendar folder id the appointments will be imported into (ImportAppointmentsRequest `l`) */
	folderId: string;
	/** Id of the message the ICS attachment belongs to */
	mid: string;
	/** Part name of the ICS attachment within the message */
	part: string;
	/** Content type of the imported data. Defaults to `text/calendar` */
	ct?: string;
};

export const importAppointmentsRequest = async ({
	folderId,
	mid,
	part,
	ct = 'text/calendar'
}: ImportAppointmentsParams): Promise<ImportAppointmentsResponse> =>
	legacySoapFetch<ImportAppointmentsRequest, ImportAppointmentsResponse | ErrorSoapBodyResponse>(
		'ImportAppointments',
		{
			_jsns: JSNS.mail,
			ct,
			l: folderId,
			content: { mid, part }
		}
	).then((response) => {
		if ('Fault' in response) {
			throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
		}
		return response;
	});
