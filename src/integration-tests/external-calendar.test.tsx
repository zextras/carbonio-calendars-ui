/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { screen, waitFor } from '@testing-library/react';
import { Folder, FOLDERS } from '@zextras/carbonio-ui-commons';

import {
	generateCalendar,
	mockExpandedFolders,
	setupSidebarIntegrationTest,
	typeCalendarName,
	typeURL
} from './utils';
import { SIDEBAR_ROOT_SUBSECTION } from '../constants/sidebar';
import {
	URL_HTTP_ERROR_CODE,
	URL_NOT_A_CALENDAR_ERROR_CODE,
	URL_UNREACHABLE_ERROR_CODE
} from '../soap/errors/error-codes';
import { UserEvent } from '@test-setup';
import { mockCreateCalendarApiOk, mockCreateCalendarFault } from '@test-utils/api/create-calendar';
import { mockSyncApiFault, mockSyncApiOk } from '@test-utils/api/sync-folder';
import { generateFolder } from '@test-utils/folders/folders-generator';

async function openImportFromURLModal(user: UserEvent, element: HTMLElement): Promise<HTMLElement> {
	await user.rightClick(element);
	const importCalendarAction = await screen.findByText('label.import');
	await user.hover(importCalendarAction);
	const importFromURL = await screen.findByText('action.import_calendar_from_url');
	await user.click(importFromURL);
	return screen.findByText('Import Calendar from URL');
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
	const confirmButton = await screen.findByText('Import');
	await user.click(confirmButton);
}

function generateExternalCalendar(): Folder {
	return generateFolder({
		name: 'External Calendar',
		id: 'external-calendar',
		url: 'https://external/calendar.ics'
	});
}

describe('External Calendar Integration Tests', () => {
	beforeAll(() => {
		window.external_calendar_feature = true;
		mockExpandedFolders([FOLDERS.USER_ROOT, SIDEBAR_ROOT_SUBSECTION.CALENDARS]);
	});

	describe('Import', () => {
		it('should create an external calendar when using "import from URL"', async () => {
			const myCalendar = generateCalendar();
			const user = await setupSidebarIntegrationTest({ calendar: myCalendar });
			const myCalendarElement = await screen.findByText(myCalendar.name);

			const importFromURLModal = await openImportFromURLModal(user, myCalendarElement);
			expect(importFromURLModal).toBeInTheDocument();
			const url = 'https://example.com/calendar/calendar.ics';
			const calendarName = 'ICS Calendar';
			const createFolderApi = mockCreateCalendarApiOk({
				_jsns: 'urn:zimbraMail',
				folder: [
					{
						id: 'new-calendar',
						uuid: 'new-calendar-uuid',
						name: calendarName,
						url,
						activesyncdisabled: false,
						recursive: false,
						deletable: false
					}
				]
			});

			await fillForm({ user, url, calendarName });
			const request = await createFolderApi;
			expect(request.folder.name).toBe(calendarName);
			expect(request.folder.url).toBe(url);
			await waitFor(() => {
				expect(importFromURLModal).not.toBeInTheDocument();
			});
		});

		test.each`
			soapFault                        | expected
			${URL_HTTP_ERROR_CODE}           | ${'The URL should begin with “http://” or “https://”'}
			${URL_UNREACHABLE_ERROR_CODE}    | ${'This link is invalid, please try to modify it or paste a new one'}
			${URL_NOT_A_CALENDAR_ERROR_CODE} | ${'This link is not a valid calendar resource, please modify it or paste a new one'}
		`('should display url error $expected', async ({ soapFault, expected }) => {
			const myCalendar = generateCalendar();
			const user = await setupSidebarIntegrationTest({ calendar: myCalendar });
			const myCalendarElement = await screen.findByText(myCalendar.name);

			const importFromURLModal = await openImportFromURLModal(user, myCalendarElement);
			expect(importFromURLModal).toBeInTheDocument();
			const url = 'value does not represent error response';
			const calendarName = 'ICS Calendar';
			const createFolderApi = mockCreateCalendarFault(soapFault);
			await fillForm({ user, url, calendarName });

			await createFolderApi;
			expect(await screen.findByText(expected)).toBeVisible();
			expect(importFromURLModal).toBeInTheDocument();
		});
	});
	describe('Sync', () => {
		it('should sync the folder when "Sync" action clicked', async () => {
			const externalCalendar = generateExternalCalendar();
			const user = await setupSidebarIntegrationTest({ calendar: externalCalendar });
			const myFolderElement = await screen.findByText(externalCalendar.name);

			const syncApi = mockSyncApiOk();
			await performSync(user, myFolderElement);
			const request = await syncApi;

			expect(request.action.op).toBe('sync');
			expect(request.action.id).toBe('external-calendar');
			expect(await screen.findByText('message.snackbar.sync')).toBeVisible();
		});

		it('should display an error snackbar when sync fails', async () => {
			const externalCalendar = generateExternalCalendar();
			const user = await setupSidebarIntegrationTest({ calendar: externalCalendar });
			const myFolderElement = await screen.findByText(externalCalendar.name);

			const syncApi = mockSyncApiFault();
			await performSync(user, myFolderElement);
			const request = await syncApi;

			expect(request.action.op).toBe('sync');
			expect(request.action.id).toBe('external-calendar');
			expect(await screen.findByText('label.error_try_again')).toBeVisible();
		});
	});
});
