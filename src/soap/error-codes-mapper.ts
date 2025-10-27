/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ErrorSoapBodyResponse } from '@zextras/carbonio-ui-soap-lib';

import { ApiError } from './types';
import { URL_HTTP_OR_HTTPS_CODE, URL_NOT_A_CALENDAR, URL_UNREACHABLE } from '../forms/error-codes';

export function mapSoapFault(response: ErrorSoapBodyResponse): ApiError {
	const error = response.Fault.Reason.Text;
	const errorResponse: ApiError = { errors: {} };
	if (error.includes('url must begin with http: or https:')) {
		errorResponse.errors.url = { [URL_HTTP_OR_HTTPS_CODE]: error };
	} else if (error.includes('Document parse failed')) {
		errorResponse.errors.url = { [URL_NOT_A_CALENDAR]: error };
	} else if (error.includes('resource unreachable')) {
		errorResponse.errors.url = { [URL_UNREACHABLE]: error };
	} else {
		errorResponse.errors.generic = error;
	}
	return errorResponse;
}

export function mapGenericError(reason: string): ApiError {
	return {
		errors: {
			generic: reason
		}
	};
}
