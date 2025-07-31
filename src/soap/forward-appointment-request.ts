/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch, ErrorSoapResponse } from '@zextras/carbonio-ui-soap-lib';

import { ForwardAppointmentRequest, ForwardAppointmentResponse } from '../types/soap/soap-actions';

export const forwardAppointmentRequest = async ({
	id,
	attendees
}: {
	id: string;
	attendees: Array<string>;
}): Promise<ForwardAppointmentResponse | ErrorSoapResponse> =>
	legacySoapFetch<ForwardAppointmentRequest, ForwardAppointmentResponse>('ForwardAppointment', {
		_jsns: 'urn:zimbraMail',

		id,
		m: { e: attendees.map((attendee) => ({ a: attendee, t: 't' })) }
	});
