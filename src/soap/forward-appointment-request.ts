/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch, ErrorSoapResponse } from '@zextras/carbonio-ui-soap-lib';

import { ForwardAppointmentRequest, ForwardAppointmentResponse } from '../types/soap/soap-actions';

export const forwardAppointmentRequest = async ({
	id,
	attendees,
	messageParts
}: {
	id: string;
	attendees: Array<string>;
	messageParts: Array<{ ct: string; content: string }>;
}): Promise<ForwardAppointmentResponse | ErrorSoapResponse> =>
	legacySoapFetch<ForwardAppointmentRequest, ForwardAppointmentResponse>('ForwardAppointment', {
		_jsns: 'urn:zimbraMail',
		id,
		m: {
			e: attendees.map((attendee) => ({ a: attendee, t: 't' })),
			...(messageParts.length > 0
				? {
						mp: {
							ct: 'multipart/alternative',
							mp: messageParts
						}
					}
				: {})
		}
	});
