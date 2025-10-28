/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { screen } from '@testing-library/react';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { generateTrashedCalendar, mockExpandedFolders, setupSidebarIntegrationTest } from './utils';
import { SIDEBAR_ROOT_SUBSECTION } from '../constants/sidebar';
import { UserEvent } from '@test-setup';
import { mockRestoreCalendarApiOk } from '@test-utils/api/restore-calendar';

async function restoreCalendar(user: UserEvent, element: HTMLElement): Promise<void> {
	await user.rightClick(element);
	const restoreCalendarAction = await screen.findByText('label.restore_calendar');
	await user.click(restoreCalendarAction);
}
describe('Restore Calendar Integration Tests', () => {
	beforeAll(() => {
		mockExpandedFolders([FOLDERS.USER_ROOT, FOLDERS.TRASH, SIDEBAR_ROOT_SUBSECTION.CALENDARS]);
	});
	it('should restore calendar when confirming restore', async () => {
		const trashedCalendar = generateTrashedCalendar();
		const user = await setupSidebarIntegrationTest({ calendar: trashedCalendar });

		const myFolderElement = await screen.findByText('Trashed Calendar');

		const restoreCalendarApi = mockRestoreCalendarApiOk();
		await restoreCalendar(user, myFolderElement);

		const request = await restoreCalendarApi;
		expect(request.action.op).toBe('move');
		expect(request.action.id).toBe(trashedCalendar.id);
		expect(request.action.l).toBe(FOLDERS.USER_ROOT);
	});
});
