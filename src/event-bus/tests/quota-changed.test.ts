/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	ONE_MB,
	publishQuotaChangedEvent,
	publishQuotaChangedEventUnconditional,
	QuotaChangedEvent
} from '../quota-changed';

describe('QuotaChangedEvent', () => {
	it('uses the calendars-scoped event name', () => {
		expect(QuotaChangedEvent.EventName).toBe('carbonio:calendars:eventbus:quota-changed');
	});

	it('constructs a CustomEvent with the correct type', () => {
		const event = new QuotaChangedEvent();
		expect(event).toBeInstanceOf(CustomEvent);
		expect(event.type).toBe(QuotaChangedEvent.EventName);
		expect(event.detail).toBeNull();
	});
});

describe('publishQuotaChangedEvent', () => {
	it('does not dispatch when size is 0', () => {
		const spy = vi.spyOn(window, 'dispatchEvent');
		publishQuotaChangedEvent(0);
		expect(spy).not.toHaveBeenCalled();
	});

	it('does not dispatch when size equals the 1 MB threshold', () => {
		const spy = vi.spyOn(window, 'dispatchEvent');
		publishQuotaChangedEvent(ONE_MB);
		expect(spy).not.toHaveBeenCalled();
	});

	it('dispatches when size exceeds the 1 MB threshold by a single byte', () => {
		const spy = vi.spyOn(window, 'dispatchEvent');
		publishQuotaChangedEvent(ONE_MB + 1);
		expect(spy).toHaveBeenCalledTimes(1);
		const [event] = spy.mock.calls[0];
		expect(event).toBeInstanceOf(QuotaChangedEvent);
	});

	it('dispatches for arbitrary large sizes', () => {
		const spy = vi.spyOn(window, 'dispatchEvent');
		publishQuotaChangedEvent(50 * ONE_MB);
		expect(spy).toHaveBeenCalledTimes(1);
	});
});

describe('publishQuotaChangedEventUnconditional', () => {
	it('always dispatches a QuotaChangedEvent', () => {
		const spy = vi.spyOn(window, 'dispatchEvent');
		publishQuotaChangedEventUnconditional();
		expect(spy).toHaveBeenCalledTimes(1);
		const [event] = spy.mock.calls[0];
		expect(event).toBeInstanceOf(QuotaChangedEvent);
	});
});
