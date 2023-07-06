/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createCalendar } from './create-calendar';

test.skip('Create a new calendar', async () => {
	const calendar = { name: 'ciccio', parent: '1', color: 3, excludeFreeBusy: true };
	const res = await createCalendar(calendar);
	const updatedState = res.payload[0];
	expect(res.calendars).toEqual(updatedState);
});
