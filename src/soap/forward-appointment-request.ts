/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse, ErrorSoapResponse, soapFetch } from '@zextras/carbonio-shell-ui';

import { ForwardAppointmentRequest } from '../types/soap/soap-actions';

type ForwardAppointmentResponse = {};
export const forwardAppointmentRequest = async ({
	id,
	attendees
}: {
	id: string;
	attendees: Array<string>;
}): Promise<ForwardAppointmentResponse | ErrorSoapResponse> =>
	soapFetch<ForwardAppointmentRequest, ForwardAppointmentResponse | ErrorSoapBodyResponse>(
		'ForwardAppointment',
		{
			_jsns: 'urn:zimbraMail',

			id,
			m: { e: attendees }
		}
	);
