/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { UserEvent, screen } from '@test-setup';

export const selectCalendarFromSelector = async (
	user: UserEvent,
	calendarName: string
): Promise<void> => {
	const input = screen.getByRole('textbox', { name: 'Type a calendar' });
	await user.type(input, calendarName);
	await user.click(await screen.findByText(calendarName));
};
