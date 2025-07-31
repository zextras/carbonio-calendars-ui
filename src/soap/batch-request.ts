/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';

import { SoapRequests } from '../types/soap/soap-actions';

export const batchRequest = async (body: SoapRequests): Promise<any> => {
	const response = legacySoapFetch('Batch', body);
	// TODO FIT TYPECHECK
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
