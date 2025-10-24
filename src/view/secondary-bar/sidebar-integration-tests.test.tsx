/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { act, screen } from '@testing-library/react';
import { Folder, FOLDERS } from '@zextras/carbonio-ui-commons';
import { combineReducers } from 'redux';

import SecondaryBar from './secondary-bar';
import { SIDEBAR_ROOT_SUBSECTION } from '../../constants/sidebar';
import { reducers } from '../../store/redux';
import { CreateFolderRequest } from '../../types/soap/createFolder';
import { setupTest, UserEvent } from '@test-setup';
import { mockSyncApiOk } from '@test-utils/api/sync-folder';
import { useLocalStorage } from '@test-utils/carbonio-shell-ui/carbonio-shell-ui';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { populateFoldersStore } from '@test-utils/store/folders';

// TODO: I think we should write tests using these utilities.
//  The idea is to think about behavior and not low-level details of the testing framework
function waitAnimationsToComplete(): void {
	act(() => jest.advanceTimersByTime(1000));
}

function mockExpandedFolders(folderIds: Array<string>): void {
	useLocalStorage.mockReturnValue([folderIds, jest.fn()]);
}

async function typeCalendarName(user: UserEvent, value: string): Promise<void> {
	const urlInput = screen.getByRole('textbox', {
		name: 'label.type_name_here'
	});
	return user.type(urlInput, value);
}

async function typeURL(user: UserEvent, value: string): Promise<void> {
	const urlInput = screen.getByRole('textbox', {
		name: 'label.url'
	});
	await user.type(urlInput, value);
}

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

async function setupIntegrationTest({ calendar }: { calendar: Folder }): Promise<UserEvent> {
	const store = configureStore({
		reducer: combineReducers(reducers)
	});
	populateFoldersStore({ customFolders: [calendar] });
	const { user } = setupTest(<SecondaryBar expanded />, { store });
	waitAnimationsToComplete();
	return user;
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

describe('SidebarIntegration tests', () => {
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

		const batchRequest = request.FolderActionRequest[0];
		expect(batchRequest.action.op).toBe('sync');
		expect(batchRequest.action.id).toBe('external-calendar');
	});
});
