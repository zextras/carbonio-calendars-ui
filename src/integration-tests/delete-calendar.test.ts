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
import {
	mockMoveCalendarToTrashApiOk,
	mockUndoMoveCalendarToTrashApiOk
} from '@test-utils/api/delete-calendar';

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
		const myCalendar = generateCalendar();
		const user = await setupSidebarIntegrationTest({ calendar: myCalendar });
		const myFolderElement = await screen.findByText(myCalendar.name);

		await openDeleteCalendarModal(user, myFolderElement);
		const deleteCalendarApi = mockMoveCalendarToTrashApiOk();
		const confirmDeleteButton = await screen.findByRole('button', {
			name: 'Delete'
		});
		await user.click(confirmDeleteButton);

		const request = await deleteCalendarApi;
		expect(request.action.op).toBe('trash');
		expect(request.action.id).toBe(myCalendar.id);
		expect(await screen.findByText('Calendar moved to trash')).toBeVisible();
		expect(confirmDeleteButton).not.toBeInTheDocument();
	});

	it('should revert trashed calendar when clicking "Undo"', async () => {
		const myCalendar = generateCalendar();
		const user = await setupSidebarIntegrationTest({ calendar: myCalendar });
		const myFolderElement = await screen.findByText(myCalendar.name);

		await openDeleteCalendarModal(user, myFolderElement);
		const deleteCalendarApi = mockMoveCalendarToTrashApiOk();
		const confirmDeleteButton = await screen.findByRole('button', {
			name: 'Delete'
		});
		await user.click(confirmDeleteButton);
		await deleteCalendarApi;

		const undoButton = await screen.findByText('Undo');
		const undoDelete = mockUndoMoveCalendarToTrashApiOk();
		expect(undoButton).toBeVisible();
		await user.click(undoButton);
		const undoRequest = await undoDelete;
		expect(undoRequest.action.op).toBe('move');
		expect(undoRequest.action.id).toBe(myCalendar.id);
	});
});
