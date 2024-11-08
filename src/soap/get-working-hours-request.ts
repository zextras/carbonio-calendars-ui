/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

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

export type GetWorkingHoursResponse = Array<{ id: string; workingHours: FreeBusy[] }>;

export type GetWorkingHoursRequest = {
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

function normalizeResponse(response: GetWorkingHoursSoapResponse): GetWorkingHoursResponse {
	return response.usr.map((user) => ({ id: user.id, workingHours: user.u }));
}

export const getWorkingHoursRequest = async ({
	startEpochMillis,
	endEpochMillis,
	emails
}: GetWorkingHoursRequest): Promise<GetWorkingHoursResponse> => {
	const response = await soapFetch<GetWorkingHoursSoapRequest, GetWorkingHoursSoapResponse>(
		'GetWorkingHours',
		{
			_jsns: 'urn:zimbraMail',
			s: startEpochMillis,
			e: endEpochMillis,
			name: emails.join(',')
		}
	);
	if (!response) return [];
	return normalizeResponse(response);
};
