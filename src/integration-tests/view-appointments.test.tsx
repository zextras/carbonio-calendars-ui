/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { screen } from '@testing-library/react';
import { FOLDERS } from '@zextras/carbonio-ui-commons';
import { formatInTimeZone } from 'date-fns-tz';

import { generateCalendar, mockExpandedFolders, setupCalendarViewIntegrationTest } from './utils';
import { SIDEBAR_ROOT_SUBSECTION } from '../constants/sidebar';
import { eventApiData } from '../test/generators/api/event';
import { mockSearchAppointmentsApi } from '@test-utils/api/search-appointments';

const generateAppointmentsResponse = (): unknown => {
	const nowMillis = Date.now();
	return {
		sortBy: 'none',
		offset: 0,
		more: false,
		appt: [
			{
				...eventApiData,
				d: nowMillis,
				inst: [
					{
						s: nowMillis,
						ridZ: formatInTimeZone(new Date(nowMillis), 'UTC', "yyyyMMdd'T'HHmmss'Z'")
					}
				]
			}
		]
	};
};
describe('View appointments Integration Tests', () => {
	beforeAll(() => {
		mockExpandedFolders([FOLDERS.USER_ROOT, SIDEBAR_ROOT_SUBSECTION.CALENDARS]);
	});

	// CalendarComponent is lazy-loaded and pulls in react-big-calendar; the first render in this
	// suite pays a one-off module transform/evaluation cost that can exceed the default timeout
	// on slower CI runners.
	it('should display Calendar appointments when clicking the calendar', async () => {
		const response = generateAppointmentsResponse();
		const myCalendar = { ...generateCalendar(), checked: true };
		const searchApi = mockSearchAppointmentsApi(response);
		await setupCalendarViewIntegrationTest({ calendar: myCalendar });

		await screen.findByText(myCalendar.name);
		await searchApi;
		await screen.findByText(eventApiData.name);
	}, 15000);
});
