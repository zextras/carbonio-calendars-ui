/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as soapLib from '@zextras/carbonio-ui-soap-lib';
import { Mock, vi } from 'vitest';

import { getSoapFetch, getXmlSoapFetch } from '@test-utils/network/fetch';

const apiManagerInstance: Omit<soapLib.ApiManager, 'sessionInfo'> = {
	getSessionInfo: vi.fn(),
	setSessionInfo: vi.fn(),
	setPollingPreference: vi.fn(),
	resetPolling: vi.fn(),
	stopPolling: vi.fn()
};

export const ApiManager = {
	getApiManager: (): Omit<soapLib.ApiManager, 'sessionInfo'> => apiManagerInstance
};

export const legacyXmlSoapFetch = getXmlSoapFetch();

export const legacySoapFetch = getSoapFetch();

export const useSync: Mock<typeof soapLib.useSync> = vi.fn(() => []);
// export const useInfoRefresh: Mock<typeof soapLib.useInfoRefresh> = vi.fn();
