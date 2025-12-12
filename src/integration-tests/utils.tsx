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

import { reducers } from '../store/redux';
import CalendarView from '../view/calendar/calendar-view';
import SecondaryBar from '../view/secondary-bar/secondary-bar';
import { useLocalStorage } from '@test-mocks/@zextras/carbonio-shell-ui';
import { setupTest, UserEvent } from '@test-setup';
import { generateFolder } from '@test-utils/folders/folders-generator';
import { populateFoldersStore } from '@test-utils/store/folders';

function waitAnimationsToComplete(): void {
	act(() => vi.advanceTimersByTime(1000));
}

export async function setupSidebarIntegrationTest({
	calendar
}: {
	calendar: Folder;
}): Promise<UserEvent> {
	const store = configureStore({
		reducer: combineReducers(reducers)
	});
	populateFoldersStore({ customFolders: [calendar] });
	const { user } = setupTest(<SecondaryBar expanded />, { store });
	waitAnimationsToComplete();
	return user;
}

export async function setupCalendarViewIntegrationTest({
	calendar
}: {
	calendar: Folder;
}): Promise<{ user: UserEvent }> {
	const store = configureStore({
		reducer: combineReducers(reducers)
	});
	populateFoldersStore({ customFolders: [calendar] });
	const { user } = setupTest(
		<>
			<SecondaryBar expanded />
			<CalendarView />
		</>,
		{ store }
	);
	waitAnimationsToComplete();
	return { user };
}

export async function typeCalendarName(user: UserEvent, value: string): Promise<void> {
	const calendarNameInput = screen.getByRole('textbox', {
		name: /Calendar name/i
	});
	await user.click(calendarNameInput);
	await user.paste(value);
}

export async function typeURL(user: UserEvent, value: string): Promise<void> {
	const urlInput = screen.getByRole('textbox', {
		name: /URL/i
	});
	await user.click(urlInput);
	await user.paste(value);
}

export function mockExpandedFolders(folderIds: Array<string>): void {
	useLocalStorage.mockReturnValue([folderIds, vi.fn()]);
}

export const generateCalendar = (): Folder =>
	generateFolder({
		name: 'My Calendar',
		id: 'my-calendar'
	});

export const generateTrashedCalendar = (): Folder =>
	generateFolder({
		name: 'Trashed Calendar',
		id: 'my-trashed-calendar',
		// fields required to make restore work
		parent: FOLDERS.TRASH,
		absFolderPath: '/Trash/trashed-folder',
		depth: 2
	});
