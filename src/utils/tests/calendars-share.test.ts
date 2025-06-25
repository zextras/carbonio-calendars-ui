import { faker } from '@faker-js/faker';
import { Grant } from '@zextras/carbonio-ui-commons';

import { SHARE_USER_TYPE } from '../../constants';
import { CALENDARS_SHARE_LINK_TYPES } from 'constants/calendar';
import { containPublicShareGrant, createCalendarShareURL } from 'utils/calendars-share';

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

describe('containPublicShareGrant', () => {
	it('should return true if public share grant is present in the share info', () => {
		const grants: Array<Grant> = [
			{
				perm: 'rwidxap',
				gt: SHARE_USER_TYPE.USER,
				d: faker.internet.email()
			},
			{
				perm: 'r',
				gt: SHARE_USER_TYPE.PUBLIC
			}
		];

		expect(containPublicShareGrant(grants)).toBe(true);
	});

	it('should return false if public share grant is not present in the share info', () => {
		const grants: Array<Grant> = [
			{
				perm: 'rwidxap',
				gt: SHARE_USER_TYPE.USER,
				d: faker.internet.email()
			},
			{
				perm: 'r',
				gt: SHARE_USER_TYPE.USER
			}
		];

		expect(containPublicShareGrant(grants)).toBe(false);
	});

	it('should return false if share info is empty', () => {
		const grants: Array<Grant> = [];

		expect(containPublicShareGrant(grants)).toBe(false);
	});
});
