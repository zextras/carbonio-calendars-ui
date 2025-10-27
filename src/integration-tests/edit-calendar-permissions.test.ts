/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { screen } from '@testing-library/react';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { mockExpandedFolders, setupIntegrationTest, typeCalendarName } from './utils';
import { SIDEBAR_ROOT_SUBSECTION } from '../constants/sidebar';
import { UserEvent } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';

async function openEditCalendarPermissionsModal(
	user: UserEvent,
	element: HTMLElement
): Promise<void> {
	await user.rightClick(element);
	const newCalendarAction = await screen.findByText('label.new_calendar');
	await user.click(newCalendarAction);
}

async function fillForm({
	user,
	calendarName
}: {
	user: UserEvent;
	calendarName: string;
}): Promise<void> {
	await typeCalendarName(user, calendarName);
	const editCalendarAction = await screen.findByText('action.edit_and_share_calendar');
	await user.click(editCalendarAction);
}

describe('Calendar Permissions Integration Tests', () => {
	beforeAll(() => {
		mockExpandedFolders([FOLDERS.USER_ROOT, SIDEBAR_ROOT_SUBSECTION.CALENDARS]);
	});
	it('should edit Calendar permissions', async () => {
		const myCalendar = generateFolder({
			name: 'My Calendar',
			id: 'my-calendar'
		});
		const user = await setupIntegrationTest({ calendar: myCalendar });

		const myFolderElement = await screen.findByText('My Calendar');

		await openEditCalendarPermissionsModal(user, myFolderElement);
		const newCalendarModal = await screen.findByText(/Edit and share calendar/i);
		// expect(newCalendarModal).toBeInTheDocument();
		// const calendarName = 'Awesome Calendar';
		// const createFolderApi = createSoapAPIInterceptor<CreateFolderRequest>('CreateFolder');
		// await fillForm({ user, calendarName });
		//
		// const request = await createFolderApi;
		// expect(request.folder.name).toBe(calendarName);
		// expect(newCalendarModal).not.toBeInTheDocument();
	});
});
