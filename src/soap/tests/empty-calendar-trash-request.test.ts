/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QuotaChangedEvent } from '../../event-bus/quota-changed';
import { emptyCalendarTrashRequest } from '../empty-calendar-trash-request';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

const countQuotaEvents = (spy: ReturnType<typeof vi.spyOn>): number =>
	spy.mock.calls.filter(([event]: [Event]) => event instanceof QuotaChangedEvent).length;

describe('emptyCalendarTrashRequest quota dispatch', () => {
	it('dispatches a QuotaChangedEvent unconditionally on success', async () => {
		createSoapAPIInterceptor('EmptyCalendarTrash', {});
		const spy = vi.spyOn(window, 'dispatchEvent');

		await emptyCalendarTrashRequest();

		expect(countQuotaEvents(spy)).toBe(1);
	});

	it('does not dispatch when the SOAP call returns a Fault', async () => {
		createSoapAPIInterceptor('EmptyCalendarTrash', {
			Fault: { Reason: { Text: 'boom' } }
		} as unknown);
		const spy = vi.spyOn(window, 'dispatchEvent');

		await expect(emptyCalendarTrashRequest()).rejects.toBeDefined();

		expect(countQuotaEvents(spy)).toBe(0);
	});
});
