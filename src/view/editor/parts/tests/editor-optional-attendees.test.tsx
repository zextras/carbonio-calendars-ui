/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { screen, waitFor, within } from '@testing-library/react';
import { DefaultContactInput, useContactInput } from '@zextras/carbonio-ui-commons';
import { combineReducers } from 'redux';
import { Mock } from 'vitest';

import {
	contactInputBuilder,
	EDIT_ACTION,
	MOCK_VALUE,
	spyDefaultValue,
	triggerOnAdd
} from './mocks';
import { generateEditor } from '../../../../commons/editor-generator';
import { PARTICIPATION_STATUS } from '../../../../constants/api';
import { reducers } from '../../../../store/redux';
import { EditorAttendees } from '../editor-attendees';
import { EditorOptionalAttendees } from '../editor-optional-attendees';
import { setupTest } from '@test-setup';

vi.mock('@zextras/carbonio-ui-commons', async () => ({
	...(await vi.importActual('@zextras/carbonio-ui-commons')),
	useContactInput: vi.fn()
}));
describe('Editor Optional Attendees', () => {
	describe('ChipInput', () => {
		beforeEach(() => {
			(useContactInput as Mock).mockReturnValue(DefaultContactInput);
		});
		it('should display optional attendee label when available', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					attendees: [{ email: 'attendee@test.com', label: 'attendee' }],
					optionalAttendees: [{ email: 'attendee-optional@test.com', label: 'attendee-optional' }]
				}
			});
			setupTest(<EditorAttendees editorId={editor.id} />, { store });
			expect(
				within(screen.getByTestId('optional-attendees-chip-input')).getByText('attendee-optional')
			).toBeVisible();
		});
		it('should display optional attendee email when label is not available', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					attendees: [{ email: 'attendee@test.com', label: 'attendee' }],
					optionalAttendees: [{ email: 'attendee-optional@test.com' }]
				}
			});
			setupTest(<EditorAttendees editorId={editor.id} />, { store });
			expect(
				within(screen.getByTestId('optional-attendees-chip-input')).getByText(
					'attendee-optional@test.com'
				)
			).toBeVisible();
		});

		it('should not clear existing optional attendees after adding a new one', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					optionalAttendees: [{ email: 'email1@test.com' }, { email: 'email2@test.com' }]
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
			expect(screen.getByText('email1@test.com')).toBeVisible();
			expect(screen.getByText('email1@test.com')).toBeVisible();
		});
	});

	describe('ContactInput', () => {
		it('should display edit action when new value in ContactInput has an error', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const newValueWithError = { ...MOCK_VALUE, error: true };
			(useContactInput as Mock).mockReturnValue(
				contactInputBuilder({ valuesToAdd: [newValueWithError] })
			);
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

		it('should keep the attendee participation status after updating the attendees', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const attendeeEmail = 'email1@test.com';

			const newValueFromAutocomplete = { ...MOCK_VALUE, label: 'test label' };

			(useContactInput as Mock).mockReturnValue(
				contactInputBuilder({ valuesToAdd: [newValueFromAutocomplete] })
			);

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					optionalAttendees: [{ email: attendeeEmail, ptst: PARTICIPATION_STATUS.ACCEPTED }]
				}
			});
			const { user } = setupTest(
				<EditorOptionalAttendees editorId={editor.id} orderedAccountIds={[]} />,
				{ store }
			);

			await triggerOnAdd(user);

			expect(spyDefaultValue).toHaveBeenCalledWith([
				expect.objectContaining({ label: attendeeEmail }),
				expect.objectContaining({ label: 'test label' })
			]);

			expect(store.getState().editor.editors[editor.id].optionalAttendees[0].ptst).toBe(
				PARTICIPATION_STATUS.ACCEPTED
			);
		});
	});
});
