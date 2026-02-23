/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse, SuccessSoapResponse } from '@zextras/carbonio-shell-ui';
import { SoapNotify } from '@zextras/carbonio-ui-soap-lib';

import { useSync } from '@test-mocks/@zextras/carbonio-ui-soap-lib';

export const buildSoapResponse = <T>(responseData: Record<string, T>): SuccessSoapResponse<T> => ({
	Header: {
		context: {}
	},
	Body: responseData
});

export const buildSoapErrorResponseBody = ({
	code = faker.number.int().toString(),
	detailCode = faker.word.noun().toUpperCase(),
	reason = faker.word.preposition(),
	trace = faker.word.preposition()
}: {
	code?: string;
	detailCode?: string;
	reason?: string;
	trace?: string;
} = {}): ErrorSoapBodyResponse => ({
	Fault: {
		Detail: { Error: { Code: detailCode, Trace: trace } },
		Reason: { Text: reason },
		Code: {
			Value: code
		}
	}
});

export const mockSoapSync = (notify: Array<SoapNotify>): void => {
	vi.mocked(useSync).mockReturnValue(notify);
};
