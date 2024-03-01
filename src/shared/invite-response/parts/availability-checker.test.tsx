/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
describe('availability checker component', () => {
	describe('the component will check the availability of the user', () => {
		test.todo('if the appointment is received by the primary account, it will be the one used');
		test.todo('if the appointment is received by the secondary account, it will be the one used');
		test.todo('it will call a getFreeBusyRequest with the user as parameter');
		test.todo('it will update when a new appointment is added'); // is it possible to test?
		describe('if the user is available at the time of the event', () => {
			test.todo('there will be a green icon');
			test.todo('there will be a string saying "You are available"');
		});
	});
});
