/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class QuotaChangedEvent extends CustomEvent<undefined> {
	static readonly EventName = 'carbonio:calendars:eventbus:quota-changed';

	constructor() {
		super(QuotaChangedEvent.EventName);
	}
}

export const ONE_MB = 1024 * 1024;

export const publishQuotaChangedEvent = (sizeInBytes: number): void => {
	if (sizeInBytes > ONE_MB) {
		window.dispatchEvent(new QuotaChangedEvent());
	}
};

export const publishQuotaChangedEventUnconditional = (): void => {
	window.dispatchEvent(new QuotaChangedEvent());
};
