/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { screen } from '@testing-library/react';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { mockExpandedFolders, setupIntegrationTest, typeCalendarName } from './utils';
import { SIDEBAR_ROOT_SUBSECTION } from '../constants/sidebar';
import { CreateFolderRequest } from '../types/soap/createFolder';
import { UserEvent } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

async function clickNewCalendar(user: UserEvent, element: HTMLElement): Promise<void> {
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
	const confirmButton = await screen.findByText('label.create');
	await user.click(confirmButton);
}

describe('New Calendar Integration Tests', () => {
	beforeAll(() => {
		mockExpandedFolders([FOLDERS.USER_ROOT, SIDEBAR_ROOT_SUBSECTION.CALENDARS]);
	});
	it('should create a new Calendar when using "New Calendar" option', async () => {
		const myCalendar = generateFolder({
			name: 'My Calendar',
			id: 'my-calendar'
		});
		const user = await setupIntegrationTest({ calendar: myCalendar });

		const myFolderElement = await screen.findByText('My Calendar');

		await clickNewCalendar(user, myFolderElement);
		const newCalendarModal = await screen.findByText(/New calendar creation/i);
		expect(newCalendarModal).toBeInTheDocument();
		const calendarName = 'Awesome Calendar';
		const createFolderApi = createSoapAPIInterceptor<CreateFolderRequest>('CreateFolder');
		await fillForm({ user, calendarName });

		const request = await createFolderApi;
		expect(request.folder.name).toBe(calendarName);
		expect(newCalendarModal).not.toBeInTheDocument();
	});
});
