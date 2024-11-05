/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getLocalHoursMinutesFromEpoch } from '../utils';

describe('getLocalHoursMinutesFromEpoch', () => {
	it('should correctly extract hours and minutes from a timestamp', () => {
		const timestamp = new Date(2023, 1, 1, 10, 0).getTime();
		const expected = { hours: 10, minutes: 0 };

		const result = getLocalHoursMinutesFromEpoch(timestamp);
		expect(result).toEqual(expected);
	});

	it('should handle midnight correctly', () => {
		const timestamp = new Date(2023, 1, 1, 0, 0).getTime();
		const expected = { hours: 0, minutes: 0 };

		const result = getLocalHoursMinutesFromEpoch(timestamp);
		expect(result).toEqual(expected);
	});

	it('should handle noon correctly', () => {
		const timestamp = new Date(2023, 1, 1, 12, 0).getTime();
		const expected = { hours: 12, minutes: 0 };

		const result = getLocalHoursMinutesFromEpoch(timestamp);
		expect(result).toEqual(expected);
	});

	it('should handle times with non-zero minutes correctly', () => {
		const timestamp = new Date(2023, 1, 1, 15, 45).getTime();
		const expected = { hours: 15, minutes: 45 };

		const result = getLocalHoursMinutesFromEpoch(timestamp);
		expect(result).toEqual(expected);
	});
});
