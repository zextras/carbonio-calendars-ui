/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { screen } from '@testing-library/react';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { mockExpandedFolders, setupIntegrationTest } from './utils';
import { SIDEBAR_ROOT_SUBSECTION } from '../constants/sidebar';
import { UserEvent } from '@test-setup';
import { mockMoveCalendarToTrashApiOk } from '@test-utils/api/delete-calendar';
import { generateFolder } from '@test-utils/folders/folders-generator';

async function openDeleteCalendarModal(user: UserEvent, element: HTMLElement): Promise<void> {
	await user.rightClick(element);
	const deleteCalendarAction = await screen.findByText('action.delete_calendar');
	await user.click(deleteCalendarAction);
}
describe('Delete Calendar Integration Tests', () => {
	beforeAll(() => {
		mockExpandedFolders([FOLDERS.USER_ROOT, SIDEBAR_ROOT_SUBSECTION.CALENDARS]);
	});
	it('should delete calendar when confirming delete', async () => {
		const myCalendar = generateFolder({
			name: 'My Calendar',
			id: 'my-calendar'
		});
		const user = await setupIntegrationTest({ calendar: myCalendar });

		const myFolderElement = await screen.findByText('My Calendar');

		await openDeleteCalendarModal(user, myFolderElement);
		const deleteCalendarApi = mockMoveCalendarToTrashApiOk();

		const confirmDeleteButton = await screen.findByRole('button', {
			name: 'Delete'
		});
		await user.click(confirmDeleteButton);

		const request = await deleteCalendarApi;
		expect(request.action.op).toBe('trash');
		expect(request.action.id).toBe(myCalendar.id);
		expect(confirmDeleteButton).not.toBeInTheDocument();
	});
});
