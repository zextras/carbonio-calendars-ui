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
import { RECURRENCE_FREQUENCY } from 'constants/recurrence';
import { TEST_SELECTORS } from 'constants/test-utils';
import { reducers } from 'store/redux';
import { EditorRecurrence } from 'view/editor/parts/recurrence/views/editor-recurrence';

const FIXED_MONDAY_START = new Date(2026, 0, 5, 9, 0, 0).getTime();

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

	describe('Reopening An Existing Recurrence', () => {
		it('should display "Every Week" for a plain weekly recurrence created via the quick option', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

			store.dispatch({
				type: 'editor/editEditorDate',
				payload: { id: editor.id, start: FIXED_MONDAY_START, end: editor.end }
			});
			store.dispatch({
				type: 'editor/editEditorRecurrence',
				payload: {
					id: editor.id,
					recur: [
						{
							add: [
								{
									rule: [
										{
											freq: RECURRENCE_FREQUENCY.WEEKLY,
											interval: [{ ival: 1 }],
											byday: [{ wkday: [{ day: 'MO' }] }]
										}
									]
								}
							]
						}
					]
				}
			});

			setupTest(<EditorRecurrence editorId={editor.id} />, { store });

			expect(screen.getByText('Every Week')).toBeVisible();
			expect(screen.queryByText('Custom')).not.toBeInTheDocument();
		});

		it('should display "Every day" for a plain daily recurrence', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

			store.dispatch({
				type: 'editor/editEditorRecurrence',
				payload: {
					id: editor.id,
					recur: [
						{
							add: [
								{
									rule: [{ freq: RECURRENCE_FREQUENCY.DAILY, interval: [{ ival: 1 }] }]
								}
							]
						}
					]
				}
			});

			setupTest(<EditorRecurrence editorId={editor.id} />, { store });

			expect(screen.getByText('Every day')).toBeVisible();
		});

		it('should still display "Custom" for a genuinely customized weekly recurrence', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({ context: { dispatch: store.dispatch, folders: {} } });

			store.dispatch({
				type: 'editor/editEditorDate',
				payload: { id: editor.id, start: FIXED_MONDAY_START, end: editor.end }
			});
			store.dispatch({
				type: 'editor/editEditorRecurrence',
				payload: {
					id: editor.id,
					recur: [
						{
							add: [
								{
									rule: [
										{
											freq: RECURRENCE_FREQUENCY.WEEKLY,
											interval: [{ ival: 1 }],
											byday: [{ wkday: [{ day: 'MO' }, { day: 'FR' }] }]
										}
									]
								}
							]
						}
					]
				}
			});

			setupTest(<EditorRecurrence editorId={editor.id} />, { store });

			expect(screen.getByText('Custom')).toBeVisible();
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
