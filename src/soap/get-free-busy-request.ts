/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';
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
export const getFreeBusyRequest = async ({
	s,
	e,
	uid,
	excludeUid
}: {
	s: number;
	e: number;
	uid: string;
	excludeUid?: string;
}): Promise<GetFreeBusyResponse> =>
	soapFetch(
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
		)
	);
