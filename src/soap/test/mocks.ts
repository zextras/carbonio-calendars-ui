/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { http, HttpResponse } from 'msw';

import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { GetFreeBusyResponse } from '../get-free-busy-request';

export const mockFreeBusyResponse = (usersFreeBusy: GetFreeBusyResponse['usr']): void => {
	getSetupServer().use(
		http.post('/service/soap/GetFreeBusyRequest', async () =>
			HttpResponse.json({
				Body: {
					GetFreeBusyResponse: {
						usr: usersFreeBusy,
						_jsns: 'urn:zimbraMail'
					}
				}
			})
		)
	);
};
