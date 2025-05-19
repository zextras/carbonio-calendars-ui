/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceLinkToAnchor } from '../utilities';

describe('replaceLinkToAnchor', () => {
	it('should return an empty string when content is empty', () => {
		expect(replaceLinkToAnchor('')).toBe('');
	});

	it('should return an empty string when content is undefined', () => {
		expect(replaceLinkToAnchor(undefined as unknown as string)).toBe('');
	});

	it('should replace a valid HTTP URL with an anchor tag', () => {
		const input = 'Visit http://example.com for more info.';
		const output =
			'Visit <a href="http://example.com" target="_blank">http://example.com</a> for more info.';
		expect(replaceLinkToAnchor(input)).toBe(output);
	});

	it('should replace a valid HTTPS URL with an anchor tag', () => {
		const input = 'Visit https://example.com for more info.';
		const output =
			'Visit <a href="https://example.com" target="_blank">https://example.com</a> for more info.';
		expect(replaceLinkToAnchor(input)).toBe(output);
	});

	it('should replace a URL without a protocol (e.g., www.example.com) with an anchor tag', () => {
		const input = 'Visit www.example.com for more info.';
		const output =
			'Visit <a href="http://www.example.com" target="_blank">www.example.com</a> for more info.';
		expect(replaceLinkToAnchor(input)).toBe(output);
	});

	it('should handle multiple URLs in the content', () => {
		const input = 'Check out http://example.com and https://another.com.';
		const output =
			'Check out <a href="http://example.com" target="_blank">http://example.com</a> and <a href="https://another.com" target="_blank">https://another.com</a>.';
		expect(replaceLinkToAnchor(input)).toBe(output);
	});

	it('should not replace URLs inside quotes', () => {
		const input = 'Visit "http://example.com" for more info.';
		const output = 'Visit "http://example.com" for more info.';
		expect(replaceLinkToAnchor(input)).toBe(output);
	});
});
