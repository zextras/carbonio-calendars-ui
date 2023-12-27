/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, waitFor, within } from '@testing-library/react';

import { EditorRecurrence } from './editor-recurrence';
import { setupTest } from '../../../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../../../commons/editor-generator';
import { reducers } from '../../../../../store/redux';

jest.setTimeout(7000);

describe('editor recurrence field', () => {
	test('is set to none as default', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: [] } });

		setupTest(<EditorRecurrence editorId={editor.id} />, {
			store
		});

		expect(editor.recur).toBeUndefined();
		expect(screen.getByText('None')).toBeVisible();
	});
	test('has 6 available options', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: [] } });

		const { user } = setupTest(<EditorRecurrence editorId={editor.id} />, {
			store
		});

		await waitFor(() => user.click(screen.getByText(/none/i)));

		const dropdownPopperEl = screen.getByTestId('dropdown-popper-list');

		expect(within(dropdownPopperEl).getByText(/none/i)).toBeVisible();
		expect(within(dropdownPopperEl).getByText(/every day/i)).toBeVisible();
		expect(within(dropdownPopperEl).getByText(/every week/i)).toBeVisible();
		expect(within(dropdownPopperEl).getByText(/every month/i)).toBeVisible();
		expect(within(dropdownPopperEl).getByText(/every year/i)).toBeVisible();
		expect(within(dropdownPopperEl).getByRole('button', { name: /custom/i })).toBeVisible();
	});
	test('clicking on “custom“ will open a modal', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: [] } });

		const { user } = setupTest(<EditorRecurrence editorId={editor.id} />, {
			store
		});
		await waitFor(() => user.click(screen.getByText(/none/i)));
		await waitFor(() => user.click(screen.getByRole('button', { name: /custom/i })));

		expect(screen.getByTestId('modal')).toBeVisible();
	});
});
