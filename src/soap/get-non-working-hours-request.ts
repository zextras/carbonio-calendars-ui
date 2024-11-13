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

export const getNonWorkingHoursRequest = async ({
	startEpochMillis,
	endEpochMillis,
	emails
}: GetNonWorkingHoursRequest): Promise<GetNonWorkingHoursResponse> => {
	const response = await soapFetch<GetWorkingHoursSoapRequest, GetWorkingHoursSoapResponse>(
		'GetWorkingHours',
		{
			_jsns: 'urn:zimbraMail',
			s: startEpochMillis,
			e: endEpochMillis,
			name: emails.join(',')
		}
	).catch((reason) => ({
		usr: []
	}));
	if (!response?.usr) return [];
	return normalizeResponse(response);
};
