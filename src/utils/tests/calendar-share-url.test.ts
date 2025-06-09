import { faker } from '@faker-js/faker';

import { CALENDARS_SHARE_LINK_TYPES } from 'constants/calendar';
import { createCalendarShareURL } from 'utils/calendar-share-url';

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
describe('createCalendarShareURL', () => {
	it('should return a proper ICS url', () => {
		const parameters = {
			domain: faker.internet.domainName(),
			user: faker.internet.userName(),
			calendarName: faker.system.fileName()
		};
		const url = createCalendarShareURL(CALENDARS_SHARE_LINK_TYPES.ics, parameters);
		expect(url).toBe(
			`https://${parameters.domain}/home/${parameters.user}/${parameters.calendarName}.ics`
		);
	});
	it('should return a proper WebCAL url', () => {
		const parameters = {
			domain: faker.internet.domainName(),
			user: faker.internet.userName(),
			calendarName: faker.system.fileName()
		};
		const url = createCalendarShareURL(CALENDARS_SHARE_LINK_TYPES.webcal, parameters);
		expect(url).toBe(
			`webcals://${parameters.domain}/home/${parameters.user}/${parameters.calendarName}`
		);
	});
	it('should return a proper CalDAV url', () => {
		const parameters = {
			domain: faker.internet.domainName(),
			user: faker.internet.userName(),
			calendarName: faker.system.fileName()
		};
		const url = createCalendarShareURL(CALENDARS_SHARE_LINK_TYPES.caldav, parameters);
		expect(url).toBe(
			`https://${parameters.domain}/dav/${parameters.user}/${parameters.calendarName}`
		);
	});

	it('should throw an error for unsupported link types', () => {
		const parameters = {
			domain: faker.internet.domainName(),
			user: faker.internet.userName(),
			calendarName: faker.system.fileName()
		};
		expect(() => {
			// @ts-expect-error Testing unsupported type
			createCalendarShareURL('unsupported', parameters);
		}).toThrow('Unsupported calendar share link type: unsupported');
	});
});
