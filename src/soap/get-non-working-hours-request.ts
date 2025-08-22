/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch, ErrorSoapBodyResponse } from '@zextras/carbonio-ui-soap-lib';

export type FreeBusy = {
	s: number;
	e: number;
};

export type GetWorkingHoursSoapResponse = {
	usr: Array<{
		id: string;
		f: FreeBusy[];
		u: FreeBusy[];
	}>;
};

export type GetNonWorkingHoursResponse = Array<{ email: string; nonWorkingHours: FreeBusy[] }>;

export type GetNonWorkingHoursRequest = {
	startEpochMillis: number;
	endEpochMillis: number;
	emails: Array<string>;
};

export type GetWorkingHoursSoapRequest = {
	_jsns: 'urn:zimbraMail';
	s: number;
	e: number;
	name: string;
};

function normalizeResponse(response: GetWorkingHoursSoapResponse): GetNonWorkingHoursResponse {
	return response.usr.map((user) => ({ email: user.id, nonWorkingHours: user.u }));
}

export async function getNonWorkingHoursRequest(
	{ startEpochMillis, endEpochMillis, emails }: GetNonWorkingHoursRequest,
	signal?: AbortSignal
): Promise<GetNonWorkingHoursResponse> {
	const response = await legacySoapFetch<
		GetWorkingHoursSoapRequest,
		GetWorkingHoursSoapResponse | ErrorSoapBodyResponse
	>(
		'GetWorkingHours',
		{
			_jsns: 'urn:zimbraMail',
			s: startEpochMillis,
			e: endEpochMillis,
			name: emails.join(',')
		},
		undefined,
		signal
	);
	if ('Fault' in response) {
		throw new Error('Received a SOAP fault');
	}
	if (!response?.usr) return [];
	return normalizeResponse(response);
}
