import { faker } from '@faker-js/faker';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { getCalendarSortCriteria } from './calendar-sort-criteria';
import { generateFolder, generateFolderLink } from '../../__test__/mocks/folders/folders-generator';
import { getMocksContext } from '../../__test__/mocks/utils/mocks-context';

/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
describe('getCalendarSortCriteria', () => {
	it('should return 0100 for root personal calendar', () => {
		const calendar = generateFolder({ id: '1' });
		const result = getCalendarSortCriteria(calendar);

		expect(result).toBe('0100');
	});

	it('should return 0500-<name> for root shared calendar', () => {
		const calendar = generateFolder({ id: '1111-2222-3333-4444-5555:1', name: 'Shared Calendar' });
		const result = getCalendarSortCriteria(calendar);

		expect(result).toBe('0500-shared calendar');
	});

	it("should return 1000 for 'Calendar' calendar", () => {
		const calendar = generateFolder({ id: FOLDERS.CALENDAR });
		const result = getCalendarSortCriteria(calendar);

		expect(result).toBe('1000');
	});

	it("should return 2000 for 'Trash'", () => {
		const calendar = generateFolder({ id: FOLDERS.TRASH });
		const result = getCalendarSortCriteria(calendar);

		expect(result).toBe('2000');
	});

	it('should return 5000-<name> for linked calendar', () => {
		const mockContext = getMocksContext();
		const calendar = generateFolderLink(
			'1',
			faker.string.uuid(),
			mockContext.otherUsersIdentities[0]
		);
		const result = getCalendarSortCriteria(calendar);

		expect(result).toBe(`5000-${calendar.name.toLowerCase()}`);
	});

	it('should return 3000-<name> for other calendars', () => {
		const calendar = generateFolder({ id: '98763', name: 'Other Cal' });
		const result = getCalendarSortCriteria(calendar);

		expect(result).toBe('3000-other cal');
	});
});
