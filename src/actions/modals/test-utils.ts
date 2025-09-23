/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TEST_SELECTORS } from '../../constants/test-utils';
import { UserEvent, screen } from '@test-setup';

export const selectCalendarFromSelector = async (
	user: UserEvent,
	calendarName: string
): Promise<void> => {
	const input = screen.getByRole('textbox', { name: 'Add Calendars' });
	await user.type(input, calendarName);
	await user.click(await screen.findByText(calendarName));
	await user.click(screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.addCalendar }));
};
