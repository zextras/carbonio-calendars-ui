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
import {
	mockDeletePermanentlyCalendarApiOk,
	mockUndoDeletePermanentlyCalendarApiOk
} from '@test-utils/api/delete-calendar';

async function openDeletePermanentlyCalendarModal(
	user: UserEvent,
	element: HTMLElement
): Promise<void> {
	await user.rightClick(element);
	const deleteCalendarAction = await screen.findByText('label.delete_permanently');
	await user.click(deleteCalendarAction);
}
describe('Delete Calendar Permanently Integration Tests', () => {
	beforeAll(() => {
		mockExpandedFolders([FOLDERS.USER_ROOT, SIDEBAR_ROOT_SUBSECTION.CALENDARS]);
	});

	it('should permanently delete calendar when confirming delete', async () => {
		const trashedCalendar = generateTrashedCalendar();
		const user = await setupSidebarIntegrationTest({ calendar: trashedCalendar });

		const myFolderElement = await screen.findByText(trashedCalendar.name);

		const deletePermamnentlyCalendarApi = mockDeletePermanentlyCalendarApiOk();
		await openDeletePermanentlyCalendarModal(user, myFolderElement);
		const confirmDeleteButton = await screen.findByRole('button', {
			name: 'Delete'
		});
		await user.click(confirmDeleteButton);

		const request = await deletePermamnentlyCalendarApi;
		expect(request.action.op).toBe('delete');
		expect(request.action.id).toBe(trashedCalendar.id);
		expect(await screen.findByText('Calendar permanently deleted')).toBeVisible();
		expect(confirmDeleteButton).not.toBeInTheDocument();
	});

	// TODO: Undo doesn't work on delete permanently, not supported by backend. Consider removing the feature
	it('should revert delete permanently calendar when clicking "Undo"', async () => {
		const trashedCalendar = generateTrashedCalendar();
		const user = await setupSidebarIntegrationTest({ calendar: trashedCalendar });

		const myFolderElement = await screen.findByText(trashedCalendar.name);

		const deletePermanentlyCalendarApi = mockDeletePermanentlyCalendarApiOk();
		await openDeletePermanentlyCalendarModal(user, myFolderElement);
		const confirmDeleteButton = await screen.findByRole('button', {
			name: 'Delete'
		});
		await user.click(confirmDeleteButton);

		await deletePermanentlyCalendarApi;
		const undoButton = await screen.findByText('Undo');
		const undoDelete = mockUndoDeletePermanentlyCalendarApiOk();
		expect(undoButton).toBeVisible();
		await user.click(undoButton);
		const undoRequest = await undoDelete;
		expect(undoRequest.action.op).toBe('move');
		expect(undoRequest.action.id).toBe(trashedCalendar.id);
	});
});
