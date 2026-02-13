/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, within } from '@testing-library/react';

import { setupTest } from '@test-setup';
import { generateEditor } from 'commons/editor-generator';
import { TEST_SELECTORS } from 'constants/test-utils';
import { reducers } from 'store/redux';
import { EditorRecurrence } from 'view/editor/parts/recurrence/views/editor-recurrence';

describe('Editor Recurrence Field', () => {
	describe('Default State', () => {
		it('should display "None" as the default value', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

			setupTest(<EditorRecurrence editorId={editor.id} />, {
				store
			});

			expect(editor.recur).toBeUndefined();
			expect(screen.getByText('None')).toBeVisible();
		});
	});

	describe('Recurrence Options Dropdown', () => {
		it('should display all 6 available recurrence options when opened', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

			const { user } = setupTest(<EditorRecurrence editorId={editor.id} />, {
				store
			});

			await user.click(screen.getByText('None'));

			const dropdownPopperEl = screen.getByTestId(TEST_SELECTORS.DROPDOWN);

			expect(within(dropdownPopperEl).getByText('None')).toBeVisible();
			expect(within(dropdownPopperEl).getByText('Every day')).toBeVisible();
			expect(within(dropdownPopperEl).getByText('Every Week')).toBeVisible();
			expect(within(dropdownPopperEl).getByText('Every Month')).toBeVisible();
			expect(within(dropdownPopperEl).getByText('Every Year')).toBeVisible();
			expect(within(dropdownPopperEl).getByRole('button', { name: 'Custom' })).toBeVisible();
		});
	});

	describe('Custom Recurrence Modal', () => {
		it('should open the custom recurrence modal when "Custom" option is clicked', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

			const { user } = setupTest(<EditorRecurrence editorId={editor.id} />, {
				store
			});

			await user.click(screen.getByText('None'));
			await user.click(screen.getByRole('button', { name: 'Custom' }));

			expect(screen.getByTestId('modal')).toBeInTheDocument();
			expect(screen.getByText('label.custom_repeat')).toBeVisible();
		});
	});
});
