/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { validateChipInput } from '../attendees-utils';

describe('validateChipInput', () => {
	it('should return an object with label and value.email equal to the provided input', () => {
		const input = 'test_string';
		expect(validateChipInput(input)).toEqual({ label: input, value: { email: input } });
	});

	test('should throw an error when input is not a string', () => {
		expect(() => validateChipInput({})).toThrow('invalid keywords received');
	});
});
