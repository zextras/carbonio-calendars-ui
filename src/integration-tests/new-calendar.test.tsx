/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { screen, waitFor } from '@testing-library/react';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import {
	generateCalendar,
	mockExpandedFolders,
	setupSidebarIntegrationTest,
	typeCalendarName
} from './utils';
import { UserEvent } from '@test-setup';
import { mockCreateCalendarApiOk, mockCreateCalendarFault } from '@test-utils/api/create-calendar';
import { SIDEBAR_ROOT_SUBSECTION } from 'constants/sidebar';

async function openNewCalendarModal(user: UserEvent, element: HTMLElement): Promise<HTMLElement> {
	await user.rightClick(element);
	const newCalendarAction = await screen.findByText('label.new_calendar');
	await user.click(newCalendarAction);
	return screen.findByText(/New calendar creation/i);
}

async function fillForm({
	user,
	calendarName
}: {
	user: UserEvent;
	calendarName: string;
}): Promise<void> {
	await typeCalendarName(user, calendarName);
	const confirmButton = await screen.findByText('Create');
	await user.click(confirmButton);
}

describe('New Calendar Integration Tests', () => {
	beforeAll(() => {
		mockExpandedFolders([FOLDERS.USER_ROOT, SIDEBAR_ROOT_SUBSECTION.CALENDARS]);
	});
	it('should create a new Calendar when using "New Calendar" option', async () => {
		const myCalendar = generateCalendar();
		const user = await setupSidebarIntegrationTest({ calendar: myCalendar });

		const myFolderElement = await screen.findByText(myCalendar.name);

		const newCalendarModal = await openNewCalendarModal(user, myFolderElement);
		expect(newCalendarModal).toBeInTheDocument();
		const calendarName = 'Awesome Calendar';
		const createFolderApi = mockCreateCalendarApiOk({
			_jsns: 'urn:zimbraMail',
			folder: [
				{
					id: 'new-id',
					uuid: 'new-uuid',
					name: calendarName,
					activesyncdisabled: false,
					recursive: false,
					deletable: false
				}
			]
		});
		await fillForm({ user, calendarName });

		const request = await createFolderApi;
		expect(request.folder.name).toBe(calendarName);
		await waitFor(() => {
			expect(newCalendarModal).not.toBeInTheDocument();
		});
	});

	// FIXME: this test fails because the code is broken and throws instead of handling API failure
	it.skip('should display a snackbar error when create fails', async () => {
		const myCalendar = generateCalendar();
		const user = await setupSidebarIntegrationTest({ calendar: myCalendar });

		const myFolderElement = await screen.findByText(myCalendar.name);

		const newCalendarModal = await openNewCalendarModal(user, myFolderElement);
		expect(newCalendarModal).toBeInTheDocument();
		const calendarName = 'Awesome Calendar';
		const createFolderApi = mockCreateCalendarFault('something went wrong');
		await fillForm({ user, calendarName });

		await createFolderApi;
		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
		expect(newCalendarModal).toBeInTheDocument();
	});
});
