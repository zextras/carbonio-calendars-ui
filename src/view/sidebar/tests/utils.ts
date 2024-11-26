/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { screen, UserEvent } from '../../../carbonio-ui-commons/test/test-setup';
import { TEST_SELECTORS } from '../../../constants/test-utils';

export const selectCalendarFromSelector = async (
	user: UserEvent,
	calendarName: string
): Promise<void> => {
	const input = screen.getByRole('textbox', { name: 'Add Calendars' });
	await user.type(input, calendarName);
	await user.click(await screen.findByText(calendarName));
	await user.click(screen.getByRoleWithIcon('button', { icon: TEST_SELECTORS.ICONS.addCalendar }));
};
