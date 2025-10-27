/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ErrorSoapBodyResponse } from '@zextras/carbonio-ui-soap-lib';

import {
	URL_HTTP_OR_HTTPS_CODE,
	URL_NOT_A_CALENDAR,
	URL_UNREACHABLE
} from '../../forms/error-codes';
import { mapSoapFault } from '../error-codes-mapper';

function generateFault(text: string): ErrorSoapBodyResponse {
	return {
		Fault: {
			Detail: {
				Error: { Code: '', Trace: '' }
			},
			Reason: {
				Text: text
			},
			Code: { Value: '' }
		}
	};
}

describe('ErrorCodeMapper', () => {
	it('maps url must be http or https error code', () => {
		const text = 'url must begin with http: or https:';
		const fault = generateFault(text);
		const apiError = mapSoapFault(fault);
		expect(apiError.errors.url).toHaveProperty(URL_HTTP_OR_HTTPS_CODE);
	});
	it('maps url unreachable error code', () => {
		const text = 'resource unreachable';
		const fault = generateFault(text);
		const apiError = mapSoapFault(fault);
		expect(apiError.errors.url).toHaveProperty(URL_UNREACHABLE);
	});
	it('maps url not a document', () => {
		const text = 'Document parse failed';
		const fault = generateFault(text);
		const apiError = mapSoapFault(fault);
		expect(apiError.errors.url).toHaveProperty(URL_NOT_A_CALENDAR);
	});

	it('maps any other error to generic maintaining the value', () => {
		const error = 'Another error';
		const fault = generateFault(error);
		const apiError = mapSoapFault(fault);
		expect(apiError.errors.generic).toBe(error);
	});
});
