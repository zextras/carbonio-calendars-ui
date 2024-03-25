/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

type Props = {
	deleteSingleInstance: boolean;
	inst?: any;
	id: string;
	isOrganizer: boolean;
	m: any;
	s: number;
};

export type CancelAppointmentRejectedType = { error: boolean; m?: never; Fault: any };
export type CancelAppointmentFulfilledType = { m: any; Fault?: never; error?: never };
export type CancelAppointmentReturnType =
	| CancelAppointmentFulfilledType
	| CancelAppointmentRejectedType;

export const cancelAppointmentRequest = async ({
	deleteSingleInstance,
	inst,
	id,
	isOrganizer,
	m,
	s
}: Props): Promise<CancelAppointmentReturnType> => {
	const body = deleteSingleInstance
		? {
				_jsns: 'urn:zimbraMail',
				inst,
				id,
				comp: '0',
				s,
				m: isOrganizer ? m : { ...m, e: [] }
			}
		: {
				_jsns: 'urn:zimbraMail',
				id,
				comp: '0',
				m: isOrganizer ? m : { ...m, e: [] }
			};
	const response: CancelAppointmentReturnType = await soapFetch('CancelAppointment', body);
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
