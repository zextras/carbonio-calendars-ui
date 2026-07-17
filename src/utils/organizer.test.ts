/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getAppointmentCreatorEmail, isAppointmentCreatedBy, isSentOnBehalfOf } from './organizer';

const ORGANIZER = 'organizer@test.com';
const DELEGATE = 'delegate@test.com';

describe('isSentOnBehalfOf', () => {
	test.each`
		organizer                                         | expected
		${undefined}                                      | ${false}
		${{ a: ORGANIZER }}                               | ${false}
		${{ a: ORGANIZER, sentBy: ORGANIZER }}            | ${false}
		${{ a: ORGANIZER, sentBy: 'Organizer@Test.com' }} | ${false}
		${{ a: ORGANIZER, sentBy: DELEGATE }}             | ${true}
	`('returns $expected for $organizer', ({ organizer, expected }) => {
		expect(isSentOnBehalfOf(organizer)).toBe(expected);
	});
});

describe('getAppointmentCreatorEmail', () => {
	test('returns the delegate address when the appointment is created on behalf of the organizer', () => {
		expect(getAppointmentCreatorEmail({ a: ORGANIZER, sentBy: DELEGATE })).toBe(DELEGATE);
	});

	test('returns the organizer address when there is no delegation', () => {
		expect(getAppointmentCreatorEmail({ a: ORGANIZER })).toBe(ORGANIZER);
	});

	test('returns undefined when there is no organizer', () => {
		expect(getAppointmentCreatorEmail(undefined)).toBeUndefined();
	});
});

describe('isAppointmentCreatedBy', () => {
	test('matches the delegate ignoring the address case, as the mailbox does', () => {
		expect(isAppointmentCreatedBy({ a: ORGANIZER, sentBy: 'Delegate@Test.com' }, DELEGATE)).toBe(
			true
		);
	});

	test('does not match the organizer when the appointment is created by a delegate', () => {
		expect(isAppointmentCreatedBy({ a: ORGANIZER, sentBy: DELEGATE }, ORGANIZER)).toBe(false);
	});

	test('matches the organizer when there is no delegation', () => {
		expect(isAppointmentCreatedBy({ a: ORGANIZER }, ORGANIZER)).toBe(true);
	});
});
