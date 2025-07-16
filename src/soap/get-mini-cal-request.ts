/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

type GetMiniCalRequestProps = {
	start: number;
	end: number;
	folder: Array<{ id: string }>;
};

export const getMiniCalRequest = async ({
	start,
	end,
	folder
}: GetMiniCalRequestProps): Promise<any> =>
	legacySoapFetch('GetMiniCal', {
		_jsns: 'urn:zimbraMail',
		e: end,
		s: start,
		folder
	});
