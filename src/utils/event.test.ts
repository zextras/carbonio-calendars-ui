/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isOccurrenceOfSeries, toSeriesEvent } from './event';
import mockedData from '../test/generators';

describe('isOccurrenceOfSeries', () => {
	it.each([
		{ isRecurrent: true, isException: false, expected: true },
		{ isRecurrent: false, isException: true, expected: true },
		{ isRecurrent: false, isException: false, expected: false },
		{ isRecurrent: false, isException: undefined, expected: false }
	])(
		'returns $expected when isRecurrent is $isRecurrent and isException is $isException',
		({ isRecurrent, isException, expected }) => {
			expect(isOccurrenceOfSeries({ isRecurrent, isException })).toBe(expected);
		}
	);
});

describe('toSeriesEvent', () => {
	it('turns an exception into its series event', () => {
		const event = mockedData.getEvent({
			resource: {
				inviteId: '100-101',
				seriesInviteId: '100-99',
				ridZ: '20261012T080000Z',
				isRecurrent: false,
				isException: true
			}
		});

		const { resource } = toSeriesEvent(event);

		expect(resource.inviteId).toBe('100-99');
		expect(resource.ridZ).toBeUndefined();
		expect(resource.isRecurrent).toBe(true);
		expect(resource.isException).toBe(false);
	});

	it('keeps the invite of an occurrence that is not an exception', () => {
		const event = mockedData.getEvent({
			resource: {
				inviteId: '100-99',
				seriesInviteId: '100-99',
				ridZ: '20261012T080000Z',
				isRecurrent: true
			}
		});

		const { resource } = toSeriesEvent(event);

		expect(resource.inviteId).toBe('100-99');
		expect(resource.ridZ).toBeUndefined();
	});
});
