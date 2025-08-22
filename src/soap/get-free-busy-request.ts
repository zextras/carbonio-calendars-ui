/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';
import { isNil, omitBy } from 'lodash';

export type FreeBusy = {
	s: number;
	e: number;
};

export type GetFreeBusyResponse = {
	usr: Array<{
		id: string;
		f?: FreeBusy[];
		b?: FreeBusy[];
		t?: FreeBusy[];
		u?: FreeBusy[];
		n?: FreeBusy[];
	}>;
};

export type GetFreeBusyRequest = {
	s: number;
	e: number;
	uid: string;
	excludeUid?: string;
};
export const getFreeBusyRequest = async (
	{ s, e, uid, excludeUid }: GetFreeBusyRequest,
	signal?: AbortSignal
): Promise<GetFreeBusyResponse> =>
	legacySoapFetch(
		'GetFreeBusy',
		omitBy(
			{
				_jsns: 'urn:zimbraMail',
				s,
				e,
				uid,
				excludeUid
			},
			isNil
		),
		undefined,
		signal
	);
