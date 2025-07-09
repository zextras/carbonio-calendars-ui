/* eslint-disable sonarjs/no-duplicate-string */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { generateResourceId, getDuplicateResourceIds, isValidResource } from '../utils';

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

	describe('getDuplicateResourceIds', () => {
		it('returns an empty set when given an empty array', () => {
			expect(getDuplicateResourceIds([])).toEqual(new Set());
		});

		it('returns an empty set when all resources are unique', () => {
			const resources = [
				{ label: 'Room1', email: 'room1@example.com', id: '1', type: 'Location' },
				{ label: 'Room2', email: 'room2@example.com', id: '2', type: 'Location' }
			];
			expect(getDuplicateResourceIds(resources)).toEqual(new Set());
		});

		it('returns a set with duplicate ids when resources share the same id', () => {
			const resources = [
				{ label: 'Room1', email: 'room1@example.com', id: '1', type: 'Location' },
				{ label: 'Room2', email: 'room2@example.com', id: '1', type: 'Location' }
			];
			expect(getDuplicateResourceIds(resources)).toEqual(new Set(['1']));
		});

		it('returns a set with duplicate emails when resources share the same email and no id', () => {
			const resources = [
				{ label: 'Room1', email: 'room@example.com', id: '', type: 'Location' },
				{ label: 'Room2', email: 'room@example.com', id: '', type: 'Location' }
			];
			expect(getDuplicateResourceIds(resources)).toEqual(new Set(['room@example.com']));
		});

		it('ignores invalid resources when checking for duplicates', () => {
			const resources = [
				{ label: '', email: 'room@example.com', id: '1', type: 'Location' },
				{ label: 'Room2', email: 'room2@example.com', id: '2', type: 'Location' },
				{ label: 'Room2', email: 'room2@example.com', id: '2', type: 'Location' }
			];
			expect(getDuplicateResourceIds(resources)).toEqual(new Set(['2']));
		});
	});
});
