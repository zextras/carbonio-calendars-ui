/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { screen, within } from '@testing-library/react';
import { combineReducers } from 'redux';

import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../../commons/editor-generator';
import { reducers } from '../../../../store/redux';
import { EditorAttendees } from '../editor-attendees';

describe('Editor Attendees', () => {
	it('should display attendees', () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				attendees: [
					{ email: 'email1@test.com', label: 'Test 1' },
					{ email: 'email1@test.com', label: 'Test 2' }
				]
			}
		});
		setupTest(<EditorAttendees editorId={editor.id} />, { store });
		expect(screen.getByText('Test 1')).toBeVisible();
		expect(screen.getByText('Test 2')).toBeVisible();
	});

	it('should add attendee to existing ones after typing in it', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });

		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				attendees: [
					{ email: 'email1@test.com', label: 'Test 1' },
					{ email: 'email1@test.com', label: 'Test 2' }
				]
			}
		});
		const { user } = setupTest(<EditorAttendees editorId={editor.id} />, { store });
		const attendees = screen.getByText('Attendees');
		const chipInput = await screen.findByTestId('attendees-chip-input');

		await user.type(within(chipInput).getByRole('textbox'), 'email3@test.com');
		await user.click(attendees);

		expect(store.getState().editor.editors[editor.id].attendees).toHaveLength(3);
		expect(screen.getByText('Test 1')).toBeVisible();
		expect(screen.getByText('Test 2')).toBeVisible();
		expect(screen.getByText('email3@test.com')).toBeVisible();
	});
});
