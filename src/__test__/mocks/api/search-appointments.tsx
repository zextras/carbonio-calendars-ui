/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

export const mockSearchAppointmentsApi = (response: unknown): Promise<unknown> =>
	createSoapAPIInterceptor('Search', response);
