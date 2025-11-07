/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { screen } from '@testing-library/react';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { generateCalendar, mockExpandedFolders, setupSidebarIntegrationTest } from './utils';
import { SIDEBAR_ROOT_SUBSECTION } from '../constants/sidebar';
import { UserEvent } from '@test-setup';

async function openEditCalendarPermissionsModal(
	user: UserEvent,
	element: HTMLElement
): Promise<void> {
	await user.rightClick(element);
	const newCalendarAction = await screen.findByText('action.edit_and_share_calendar');
	await user.click(newCalendarAction);
}

describe('Calendar Permissions Integration Tests', () => {
	beforeAll(() => {
		mockExpandedFolders([FOLDERS.USER_ROOT, SIDEBAR_ROOT_SUBSECTION.CALENDARS]);
	});
	it('should edit Calendar permissions', async () => {
		const myCalendar = generateCalendar();
		const user = await setupSidebarIntegrationTest({ calendar: myCalendar });

		const myFolderElement = await screen.findByText(myCalendar.name);

		await openEditCalendarPermissionsModal(user, myFolderElement);
		expect(await screen.findByText(/Edit and share calendar/i)).toBeInTheDocument();
	});
});
