/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isRemoteFolder, replaceLinkToAnchor } from '../utilities';

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

describe('isRemoteFolder', () => {
	const mockFolders = {
		'1': { isLink: true, rid: '100' },
		'2': { isLink: false, rid: '200' }, // Not a link
		'3': { isLink: true }, // No rid
		'4': { isLink: true, rid: '300' }
	};

	it('should return true if folder id matches a remote folder rid', () => {
		const folder = { id: '100' };
		expect(isRemoteFolder(folder, mockFolders)).toBe(true);
	});

	it('should return true if folder id part after colon matches a remote folder rid', () => {
		const folder = { id: 'account:300' };
		expect(isRemoteFolder(folder, mockFolders)).toBe(true);
	});

	it('should return false if folder id does not match any remote folder rid', () => {
		const folder = { id: '999' };
		expect(isRemoteFolder(folder, mockFolders)).toBe(false);
	});

	it('should return false if folder id part after colon does not match any remote folder rid', () => {
		const folder = { id: 'account:999' };
		expect(isRemoteFolder(folder, mockFolders)).toBe(false);
	});

	it('should return false if folders list is empty', () => {
		const folder = { id: '100' };
		expect(isRemoteFolder(folder, {})).toBe(false);
	});
});
