/* eslint-disable sonarjs/no-duplicate-string */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { generateResourceId, isValidResource } from '../utils';

describe('Utils', () => {
	describe('generateResourceId', () => {
		it('returns trimmed email if present and non-empty', () => {
			const resource = { email: '  user@example.com  ', id: '123', label: 'User' };
			expect(generateResourceId(resource)).toBe('user@example.com');
		});

		it('returns trimmed id if email is missing or empty', () => {
			const resource = { email: '   ', id: '  456  ', label: 'User' };
			expect(generateResourceId(resource)).toBe('456');
		});

		it('returns label with timestamp if both email and id are missing or empty', () => {
			const resource = { email: '', id: '', label: '  My Label  ' };
			const result = generateResourceId(resource);
			expect(result.startsWith('My Label-')).toBe(true);
			expect(Number.isNaN(Number(result.split('-')[1]))).toBe(false);
		});

		it('returns unknown with timestamp if label is missing', () => {
			const resource = { email: '', id: '', label: undefined as unknown as string };
			const result = generateResourceId(resource);
			expect(result.startsWith('unknown-')).toBe(true);
			expect(Number.isNaN(Number(result.split('-')[1]))).toBe(false);
		});
	});

	describe('isValidResource', () => {
		it('returns true when resource has non-empty label and email', () => {
			const resource = { label: 'Room', email: 'room@example.com', id: '1', type: 'Location' };
			expect(isValidResource(resource)).toBe(true);
		});

		it('returns false when resource is undefined', () => {
			expect(isValidResource(undefined)).toBe(false);
		});

		it('returns false when label is empty', () => {
			const resource = { label: '', email: 'room@example.com', id: '1', type: 'Location' };
			expect(isValidResource(resource)).toBe(false);
		});

		it('returns false when email is empty', () => {
			const resource = { label: 'Room', email: '', id: '1', type: 'Location' };
			expect(isValidResource(resource)).toBe(false);
		});

		it('returns false when label is only whitespace', () => {
			const resource = { label: '   ', email: 'room@example.com', id: '1', type: 'Location' };
			expect(isValidResource(resource)).toBe(false);
		});

		it('returns false when email is only whitespace', () => {
			const resource = { label: 'Room', email: '   ', id: '1', type: 'Location' };
			expect(isValidResource(resource)).toBe(false);
		});

		it('returns true when label and email have leading/trailing whitespace', () => {
			const resource = {
				label: '  Room  ',
				email: '  room@example.com  ',
				id: '1',
				type: 'Location'
			};
			expect(isValidResource(resource)).toBe(true);
		});
	});
});
