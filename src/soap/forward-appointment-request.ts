/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapResponse, soapFetch } from '@zextras/carbonio-shell-ui';

import { ForwardAppointmentRequest, ForwardAppointmentResponse } from '../types/soap/soap-actions';

export const forwardAppointmentRequest = async ({
	id,
	attendees
}: {
	id: string;
	attendees: Array<string>;
}): Promise<ForwardAppointmentResponse | ErrorSoapResponse> =>
	soapFetch<ForwardAppointmentRequest, ForwardAppointmentResponse>('ForwardAppointment', {
		_jsns: 'urn:zimbraMail',

		id,
		m: { e: attendees.map((attendee) => ({ a: attendee, t: 't' })) }
	});
