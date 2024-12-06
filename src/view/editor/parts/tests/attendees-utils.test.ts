/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ChipAction } from '@zextras/carbonio-design-system';

import { EDIT_ACTION } from './mocks';
import { CONTACT_TYPES } from '../../../../carbonio-ui-commons/integrations/constants';
import { ContactInputItem } from '../../../../carbonio-ui-commons/integrations/types';
import { applyAttendeeToContactInputItem, validateChipInput } from '../attendees-utils';

const createUserChip = ({
	email = 'test@test.com',
	label = 'Test label',
	error = false,
	fullName,
	firstName,
	lastName,
	actions = []
}: {
	label?: string;
	email?: string;
	error?: boolean;
	fullName?: string;
	firstName?: string;
	lastName?: string;
	actions?: Array<ChipAction>;
} = {}): ContactInputItem => ({
	id: '123',
	label,
	error,
	value: {
		id: '1',
		email,
		fullName,
		firstName,
		lastName,
		type: CONTACT_TYPES.CONTACT
	},
	actions
});

describe('attendee utils', () => {
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

		it('should remove edit action when no error', async () => {
			expect(
				applyAttendeeToContactInputItem(
					attendee,
					createUserChip({ error: false, actions: [EDIT_ACTION] })
				)
			).toMatchObject({
				actions: []
			});
		});

		it('should display edit action when error', async () => {
			expect(
				applyAttendeeToContactInputItem(
					attendee,
					createUserChip({ error: true, actions: [EDIT_ACTION] })
				)
			).toMatchObject({
				actions: [EDIT_ACTION]
			});
		});
	});
});
