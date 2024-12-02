/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { EDIT_ACTION } from './mocks';
import { applyAttendeeToContactInputItem, validateChipInput } from '../attendees-utils';

describe('validateChipInput', () => {
	it('should return an object with label and value.email equal to the provided input', () => {
		const input = 'test_string';
		expect(validateChipInput(input)).toEqual({ label: input, value: { email: input } });
	});

	test('should throw an error when input is not a string', () => {
		expect(() => validateChipInput({})).toThrow('invalid keywords received');
	});
});

describe('applyAttendeeToContactInputItem', () => {
	const attendee = { email: 'test@test.com', fullName: 'Test' };

	it('should set firstName and lastName as undefined', async () => {
		expect(
			applyAttendeeToContactInputItem(attendee, { id: '123', firstName: 'aaaa', lastName: 'bbb' })
		).toMatchObject({
			firstName: undefined,
			lastName: undefined
		});
	});

	it('should use attendee email when empty object provided', async () => {
		expect(applyAttendeeToContactInputItem(attendee, undefined)).toMatchObject({
			email: attendee.email
		});
	});

	it('should remove edit action when no error', async () => {
		expect(
			applyAttendeeToContactInputItem(attendee, { id: '123', error: false, actions: [EDIT_ACTION] })
		).toMatchObject({
			actions: []
		});
	});

	it('should always use attendee fullName', async () => {
		expect(applyAttendeeToContactInputItem(attendee, { id: '123', fullName: 'AAA' })).toMatchObject(
			{
				fullName: attendee.fullName
			}
		);
	});

	it('should display edit action when error', async () => {
		expect(
			applyAttendeeToContactInputItem(attendee, {
				id: '123',
				error: true,
				actions: [EDIT_ACTION]
			})
		).toMatchObject({
			actions: [EDIT_ACTION]
		});
	});
});
