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
	describe('Attendees', () => {
		it('should display attendee email if attendee does not have a label', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					attendees: [{ email: 'email1@test.com' }]
				}
			});
			setupTest(<EditorAttendees editorId={editor.id} />, { store });
			expect(screen.getByText('email1@test.com')).toBeVisible();
		});

		it('should display attendee label in chip if label available', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					attendees: [{ email: 'email1@test.com', label: 'Test 1' }]
				}
			});
			setupTest(<EditorAttendees editorId={editor.id} />, { store });
			expect(screen.getByText('Test 1')).toBeVisible();
		});

		it('should display multiple attendees', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					attendees: [
						{ email: 'email1@test.com', label: 'Test 1' },
						{ email: 'email2@test.com', label: 'Test 2' }
					]
				}
			});
			setupTest(<EditorAttendees editorId={editor.id} />, { store });
			expect(screen.getByText('Test 1')).toBeVisible();
			expect(screen.getByText('Test 2')).toBeVisible();
		});

		it('should add a new attendee after typing in the contact input', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					attendees: []
				}
			});
			const { user } = setupTest(<EditorAttendees editorId={editor.id} />, { store });
			const optionalsAttendeesInput = screen.getByText('Optionals');
			const chipInput = await screen.findByTestId('attendees-chip-input');

			await user.type(within(chipInput).getByRole('textbox'), 'email3@test.com');
			await user.click(optionalsAttendeesInput);

			expect(screen.getByText('email3@test.com')).toBeVisible();
		});

		it('should not clear existing attendees after adding a new one', async () => {
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
			const optionalsAttendeesInput = screen.getByText('Optionals');
			const chipInput = await screen.findByTestId('attendees-chip-input');

			await user.type(within(chipInput).getByRole('textbox'), 'email3@test.com');
			await user.click(optionalsAttendeesInput);

			expect(screen.getByText('email3@test.com')).toBeVisible();
			expect(screen.getByText('Test 2')).toBeVisible();
			expect(screen.getByText('Test 1')).toBeVisible();
		});
	});

	describe('Optional Attendees', () => {
		it('should not clear existing optional attendees after adding a new one', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					optionalAttendees: [
						{ email: 'email1@test.com', label: 'Test 1' },
						{ email: 'email1@test.com', label: 'Test 2' }
					]
				}
			});
			const { user } = setupTest(<EditorAttendees editorId={editor.id} />, { store });
			const chipInput = await screen.findByTestId('optional-attendees-chip-input');
			const attendees = await screen.findAllByText('Attendees');

			await user.type(within(chipInput).getByRole('textbox'), 'email3@test.com');
			await user.click(attendees[0]);

			expect(await screen.findByText('email3@test.com')).toBeInTheDocument();
			expect(screen.getByText('Test 2')).toBeVisible();
			expect(screen.getByText('Test 1')).toBeVisible();
		});
	});
});
