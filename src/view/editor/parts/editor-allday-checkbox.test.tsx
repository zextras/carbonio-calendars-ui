/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import React from 'react';
import { setupTest } from '../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../commons/editor-generator';
import { reducers } from '../../../store/redux';
import { EditorAllDayCheckbox } from './editor-allday-checkbox';

describe('editor all day checkbox', () => {
	test('on click editor inside store will have all day option set as true', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const editor = generateEditor({ context: { dispatch: store.dispatch, folders: [] } });

		const { user } = setupTest(<EditorAllDayCheckbox editorId={editor.id} />, { store });

		const previousEditor = store.getState().editor.editors[editor.id];
		expect(previousEditor).toBeDefined();
		expect(previousEditor.allDay).toEqual(false);

		const allDayCheckbox = screen.getByTestId('icon: Square');
		await user.click(allDayCheckbox);

		const updatedEditor = store.getState().editor.editors[editor.id];
		expect(updatedEditor.allDay).toEqual(true);
	});
});