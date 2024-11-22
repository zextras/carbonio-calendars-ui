/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { screen, waitFor, within } from '@testing-library/react';
import * as shellUi from '@zextras/carbonio-shell-ui';
import { combineReducers } from 'redux';

import { ContactInput, ContactInputError, EDIT_ACTION, spyDefaultValue } from './mocks';
import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../../commons/editor-generator';
import { reducers } from '../../../../store/redux';
import { EditorOptionalAttendees } from '../editor-optional-attendees';

describe('Editor Optional Attendees', () => {
	beforeEach(() => {
		jest.spyOn(shellUi, 'useIntegratedComponent').mockReturnValue([ContactInput, false]);
	});
	describe('ChipInput', () => {
		it('should display optional attendees', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					optionalAttendees: [
						{ email: 'email1@test.com', label: 'Optional Test 1' },
						{ email: 'email1@test.com', label: 'Optional Test 2' }
					]
				}
			});

			setupTest(<EditorOptionalAttendees orderedAccountIds={[]} editorId={editor.id} />, { store });

			expect(screen.getByText('Optional Test 2')).toBeVisible();
			expect(screen.getByText('Optional Test 1')).toBeVisible();
		});

		it('should not clear existing optional attendees after adding a new one', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					optionalAttendees: [
						{ email: 'email1@test.com', label: 'Test 1' },
						{ email: 'email2@test.com', label: 'Test 2' }
					]
				}
			});
			const { user } = setupTest(
				<EditorOptionalAttendees orderedAccountIds={[]} editorId={editor.id} />,
				{ store }
			);
			const chipInput = await screen.findByTestId('optional-attendees-chip-input');

			await user.type(within(chipInput).getByRole('textbox'), 'email3@test.com');
			await user.click(screen.getAllByRole('paragraph')[0]);

			expect(await screen.findByText('email3@test.com')).toBeInTheDocument();
			expect(screen.getByText('Test 2')).toBeVisible();
			expect(screen.getByText('Test 1')).toBeVisible();
		});

		it('should display optional attendee label in chip if label available', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					optionalAttendees: [{ email: 'email1@test.com', label: 'Test 1' }]
				}
			});

			setupTest(<EditorOptionalAttendees orderedAccountIds={[]} editorId={editor.id} />, { store });

			expect(screen.getByText('Test 1')).toBeVisible();
		});

		it('should display optional attendee email in chip if label not available', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					optionalAttendees: [{ email: 'email1@test.com' }]
				}
			});
			setupTest(<EditorOptionalAttendees orderedAccountIds={[]} editorId={editor.id} />, { store });

			expect(screen.getByText('email1@test.com')).toBeVisible();
		});
	});

	describe('ContactInput', () => {
		it('should display edit action when new value in ContactInput has an error', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			jest.spyOn(shellUi, 'useIntegratedComponent').mockReturnValue([ContactInputError, true]);
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					optionalAttendees: [{ email: 'email1@test.com', label: 'Test 1' }]
				}
			});
			const { user } = setupTest(
				<EditorOptionalAttendees orderedAccountIds={[]} editorId={editor.id} />,
				{ store }
			);
			const testButton = await screen.findByTestId('test-button');
			await user.click(testButton);

			await waitFor(() => {
				expect(spyDefaultValue).toBeCalledWith(
					expect.arrayContaining([
						expect.objectContaining({
							error: true,
							actions: [EDIT_ACTION]
						})
					])
				);
			});
		});

		it('should not display edit action when new value in ContactInput has no errors', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			jest.spyOn(shellUi, 'useIntegratedComponent').mockReturnValue([ContactInput, true]);
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					optionalAttendees: [{ email: 'email1@test.com', label: 'Test 1' }]
				}
			});
			const { user } = setupTest(
				<EditorOptionalAttendees orderedAccountIds={[]} editorId={editor.id} />,
				{ store }
			);
			const testButton = await screen.findByTestId('test-button');
			await user.click(testButton);

			await waitFor(() => {
				expect(spyDefaultValue).toBeCalledWith(
					expect.arrayContaining([
						expect.objectContaining({
							error: false,
							actions: []
						})
					])
				);
			});
		});

		it('should not pass firstName, lastName, label to the ContactInput component', async () => {
			jest.spyOn(shellUi, 'useIntegratedComponent').mockReturnValue([ContactInput, true]);
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					optionalAttendees: [{ email: 'email1@test.com', fullName: 'Test 1' }]
				}
			});
			setupTest(<EditorOptionalAttendees orderedAccountIds={[]} editorId={editor.id} />, {
				store
			});

			expect(spyDefaultValue).toHaveBeenCalledWith([
				{
					fullName: 'Test 1',
					email: 'email1@test.com',
					actions: undefined,
					error: undefined,
					id: undefined
				}
			]);
		});
	});
});
