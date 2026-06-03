/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import * as shell from '@zextras/carbonio-shell-ui';

import { setupTest } from '../../__test__/test-setup';
import { QuotaChangedEvent } from '../../event-bus/quota-changed';
import { QuotaRefreshHandler } from '../quota-refresh-handler';

describe('QuotaRefreshHandler', () => {
	it('calls the storages-refresh-quota integrated function when the event is dispatched', () => {
		const refreshQuota = vi.fn();
		const getIntegratedFunctionSpy = vi
			.spyOn(shell, 'getIntegratedFunction')
			.mockReturnValue([refreshQuota, true]);

		setupTest(<QuotaRefreshHandler />);
		window.dispatchEvent(new QuotaChangedEvent());

		expect(getIntegratedFunctionSpy).toHaveBeenCalledWith('storages-refresh-quota');
		expect(refreshQuota).toHaveBeenCalledTimes(1);
	});

	it('does not invoke anything when the integrated function is unavailable', () => {
		const refreshQuota = vi.fn();
		vi.spyOn(shell, 'getIntegratedFunction').mockReturnValue([refreshQuota, false]);

		setupTest(<QuotaRefreshHandler />);
		window.dispatchEvent(new QuotaChangedEvent());

		expect(refreshQuota).not.toHaveBeenCalled();
	});

	it('removes the listener on unmount', () => {
		const refreshQuota = vi.fn();
		vi.spyOn(shell, 'getIntegratedFunction').mockReturnValue([refreshQuota, true]);

		const { unmount } = setupTest(<QuotaRefreshHandler />);
		unmount();
		window.dispatchEvent(new QuotaChangedEvent());

		expect(refreshQuota).not.toHaveBeenCalled();
	});
});
