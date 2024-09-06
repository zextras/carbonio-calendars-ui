/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapResponse, soapFetch } from '@zextras/carbonio-shell-ui';

type ForwardAppointmentResponse = {};
export const forwardAppointmentRequest = async ({
	id,
	attendees
}: {
	id: string;
	recipients: Array<string>;
}): Promise<ForwardAppointmentResponse | ErrorSoapResponse> =>
	soapFetch('ForwardAppointment', {
		_jsns: 'urn:zimbraMail',

		id,
		m: { e: attendees }
	});
