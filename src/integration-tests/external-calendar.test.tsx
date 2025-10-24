/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { screen } from '@testing-library/react';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { mockExpandedFolders, setupIntegrationTest, typeCalendarName, typeURL } from './utils';
import { SIDEBAR_ROOT_SUBSECTION } from '../constants/sidebar';
import { CreateFolderRequest } from '../types/soap/createFolder';
import { UserEvent } from '@test-setup';
import { mockSyncApiOk } from '@test-utils/api/sync-folder';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';

async function performImportFromURL(user: UserEvent, element: HTMLElement): Promise<void> {
	await user.rightClick(element);
	const importCalendarAction = await screen.findByText('action.calendar_upload');
	await user.hover(importCalendarAction);
	const importFromURL = await screen.findByText('action.import_calendar_from_url');
	await user.click(importFromURL);
}

async function performSync(user: UserEvent, element: HTMLElement): Promise<void> {
	await user.rightClick(element);
	const importCalendarAction = await screen.findByText('action.sync');
	await user.click(importCalendarAction);
}

async function fillForm({
	user,
	calendarName,
	url
}: {
	user: UserEvent;
	calendarName: string;
	url: string;
}): Promise<void> {
	await typeCalendarName(user, calendarName);
	await typeURL(user, url);
	const confirmButton = await screen.findByText('label.create');
	await user.click(confirmButton);
}

describe('External Calendar Integration Tests', () => {
	beforeAll(() => {
		mockExpandedFolders([FOLDERS.USER_ROOT, SIDEBAR_ROOT_SUBSECTION.CALENDARS]);
	});

	it('should create an external calendar when using "import from URL"', async () => {
		const myCalendar = generateFolder({
			name: 'My Calendar',
			id: 'my-calendar'
		});
		const user = await setupIntegrationTest({ calendar: myCalendar });

		const myFolderElement = await screen.findByText('My Calendar');

		await performImportFromURL(user, myFolderElement);
		const importFromURLModal = await screen.findByText('folder.modal.import_from_url.title2');
		expect(importFromURLModal).toBeInTheDocument();
		const url = 'https://example.com/calendar/calendar.ics';
		const calendarName = 'ICS Calendar';
		const createFolderApi = createSoapAPIInterceptor<CreateFolderRequest>('CreateFolder');
		await fillForm({ user, url, calendarName });

		const request = await createFolderApi;
		expect(request.folder.name).toBe(calendarName);
		expect(request.folder.url).toBe(url);
		expect(importFromURLModal).not.toBeInTheDocument();
	});
	it('should sync the folder when "Sync" action clicked', async () => {
		const externalCalendar = generateFolder({
			name: 'External Calendar',
			id: 'external-calendar',
			url: 'https://external/calendar.ics'
		});
		const user = await setupIntegrationTest({ calendar: externalCalendar });
		const myFolderElement = await screen.findByText('External Calendar');

		const syncApi = mockSyncApiOk();
		await performSync(user, myFolderElement);
		const request = await syncApi;

		expect(request.action.op).toBe('sync');
		expect(request.action.id).toBe('external-calendar');
	});
});
