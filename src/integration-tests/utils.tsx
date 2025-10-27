/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { act, screen } from '@testing-library/react';
import { Folder } from '@zextras/carbonio-ui-commons';
import { combineReducers } from 'redux';

import { reducers } from '../store/redux';
import SecondaryBar from '../view/secondary-bar/secondary-bar';
import { setupTest, UserEvent } from '@test-setup';
import { useLocalStorage } from '@test-utils/carbonio-shell-ui/carbonio-shell-ui';
import { populateFoldersStore } from '@test-utils/store/folders';

function waitAnimationsToComplete(): void {
	act(() => jest.advanceTimersByTime(1000));
}
export async function setupIntegrationTest({ calendar }: { calendar: Folder }): Promise<UserEvent> {
	const store = configureStore({
		reducer: combineReducers(reducers)
	});
	populateFoldersStore({ customFolders: [calendar] });
	const { user } = setupTest(<SecondaryBar expanded />, { store });
	waitAnimationsToComplete();
	return user;
}

export async function typeCalendarName(user: UserEvent, value: string): Promise<void> {
	const urlInput = screen.getByRole('textbox', {
		name: /Calendar name/i
	});
	return user.type(urlInput, value);
}

export async function typeURL(user: UserEvent, value: string): Promise<void> {
	const urlInput = screen.getByRole('textbox', {
		name: /URL/i
	});
	await user.type(urlInput, value);
}

export function mockExpandedFolders(folderIds: Array<string>): void {
	useLocalStorage.mockReturnValue([folderIds, jest.fn()]);
}
