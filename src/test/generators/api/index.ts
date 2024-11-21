/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';

export const generateApiErrorResponse = (): ErrorSoapBodyResponse => ({
	Fault: {
		Detail: {
			Error: {
				Code: faker.string.alphanumeric(10),
				Trace: faker.lorem.sentence()
			}
		},
		Reason: {
			Text: faker.lorem.sentence()
		},
		Code: {
			Value: faker.string.alphanumeric(10)
		}
	}
});
