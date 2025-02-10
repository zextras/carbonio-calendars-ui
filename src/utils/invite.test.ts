/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';

import { hasDescription } from './invite';
import generateInvite from '../test/generators/invite';

describe('hasDescription', () => {
	it('should return true if the invite has a plain text description', () => {
		const invite = generateInvite({
			context: { textDescription: [{ _content: faker.word.words() }] }
		});

		expect(hasDescription(invite)).toBe(true);
	});

	it("should return false if the invite doesn't have a plain text description", () => {
		const invite = generateInvite({
			context: { textDescription: [] }
		});

		expect(hasDescription(invite)).toBe(false);
	});

	it('should return false if the invite has an empty description', () => {
		const invite = generateInvite({
			context: { textDescription: [{ _content: '' }] }
		});

		expect(hasDescription(invite)).toBe(false);
	});

	it('should return false if the invite has a description with only whitespaces', () => {
		const invite = generateInvite({
			context: { textDescription: [{ _content: '   \t\n' }] }
		});

		expect(hasDescription(invite)).toBe(false);
	});

	/**
	 * This corner case is an issue in the current implementation of the module.
	 */
	it('should return false if the invite has a description with only a double quote', () => {
		const invite = generateInvite({
			context: { textDescription: [{ _content: '"' }] }
		});

		expect(hasDescription(invite)).toBe(false);
	});
});
