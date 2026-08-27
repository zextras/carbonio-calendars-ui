/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ColorDotOption, findExactColorIndex } from '../color-dots-row';

describe('findExactColorIndex', () => {
	it('returns undefined when hex is undefined', () => {
		expect(findExactColorIndex([], undefined)).toBeUndefined();
	});

	it('returns undefined when hex is an empty string', () => {
		const colors: ColorDotOption[] = [{ hex: '#000000', label: 'black' }];
		expect(findExactColorIndex(colors, '')).toBeUndefined();
	});

	it('returns the index of the option whose hex matches case-insensitively', () => {
		const colors: ColorDotOption[] = [
			{ hex: '#000000', label: 'black' },
			{ hex: '#FF0000', label: 'red' },
			{ hex: '#00FF00', label: 'green' }
		];
		expect(findExactColorIndex(colors, '#ff0000')).toBe(1);
	});

	it('returns undefined when no option matches the given hex', () => {
		const colors: ColorDotOption[] = [
			{ hex: '#000000', label: 'black' },
			{ hex: '#FF0000', label: 'red' }
		];
		expect(findExactColorIndex(colors, '#0000FF')).toBeUndefined();
	});
});
