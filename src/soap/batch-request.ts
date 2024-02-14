/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { soapFetch } from '@zextras/carbonio-shell-ui';

import { SoapRequests } from '../types/soap/soap-actions';

export const batchRequest = async (body: SoapRequests): Promise<any> => {
	const response = soapFetch('Batch', body);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return response?.Fault ? { ...response.Fault, error: true } : response;
};
