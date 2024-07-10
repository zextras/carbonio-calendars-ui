/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forEach } from 'lodash';

import { getAlarmValueInMinutes } from './normalizations-utils';

describe('NormalizationsUtils', () => {
	describe('getAlarmValueInMinutes', () => {
		test.each([
			{ input: undefined, output: '0' },
			{ input: { s: 60 }, output: '1' },
			{ input: { m: 30 }, output: '30' },
			{ input: { h: 2 }, output: '120' },
			{ input: { d: 2 }, output: '2880' },
			{ input: { w: 2 }, output: '20160' }
		])('When input is $input converts in $output minutes', ({ input, output }) => {
			const result = getAlarmValueInMinutes(input);
			expect(result).toEqual(output);
		});
		test.each([{ s: 0 }, { m: 0 }, { h: 0 }, { d: 0 }, { w: 0 }])(
			'When input is %o converts in -1 which is used in the editor to represent at the time of the event',
			(input) => {
				const result = getAlarmValueInMinutes(input);
				expect(result).toEqual('-1');
			}
		);
		test('When input is in seconds and it is a number between 1 and 59 it converts to 1 minute', () => {
			const seconds = Array.from({ length: 58 }, (v, k) => k + 1);
			forEach(seconds, (second) => {
				const result = getAlarmValueInMinutes({ s: second });
				expect(result).toEqual('1');
			});
		});
	});
});
