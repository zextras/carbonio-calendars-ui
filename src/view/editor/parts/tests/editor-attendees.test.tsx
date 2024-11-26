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

import {
	ContactInput,
	ContactInputDistributionList,
	ContactInputError,
	ContactInputGroup,
	EDIT_ACTION,
	spyDefaultValue
} from './mocks';
import { createSoapAPIInterceptor } from '../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { buildSoapErrorResponseBody } from '../../../../carbonio-ui-commons/test/mocks/utils/soap';
import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../../commons/editor-generator';
import { mockFreeBusyResponse, mockGetShareInfo } from '../../../../soap/tests/mocks';
import { reducers } from '../../../../store/redux';
import { EditorAttendees } from '../editor-attendees';

describe('Editor Attendees', () => {
	beforeEach(() => {
		jest.spyOn(shellUi, 'useIntegratedComponent').mockReturnValue([ContactInput, false]);
	});

	it('should display error snackbar when failing to get account ids', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const shareInfoInterceptor = createSoapAPIInterceptor(
			'GetShareInfo',
			buildSoapErrorResponseBody()
		);
		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {}
			}
		});
		setupTest(<EditorAttendees editorId={editor.id} />, { store });

		await shareInfoInterceptor;
		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
	});
	it('should display attendee not available when already busy during current appointment', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		const attendeeEmail = 'email1@test.com';
		const appointmentStart = new Date(2024, 10, 1, 10, 30);
		const appointmentEnd = new Date(2024, 10, 1, 12, 30);
		const shareInfoInterceptor = mockGetShareInfo();
		const freeBusyInterceptor = mockFreeBusyResponse([
			{
				id: attendeeEmail,
				b: [
					{
						s: new Date(2024, 10, 1, 11, 0).getTime(),
						e: new Date(2024, 10, 1, 11, 130).getTime()
					}
				]
			}
		]);
		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				start: appointmentStart.getTime(),
				end: appointmentEnd.getTime(),
				attendees: [{ email: attendeeEmail }]
			}
		});
		setupTest(<EditorAttendees editorId={editor.id} />, { store });

		await freeBusyInterceptor;
		await shareInfoInterceptor;

		expect(screen.getByText(attendeeEmail)).toBeVisible();
		expect(
			await screen.findByText(
				'One or more attendees are not available at the selected time of the event'
			)
		).toBeVisible();
	});

	describe('ChipInput', () => {
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

		it('should add a new attendee after typing in the chip input', async () => {
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
						{ email: 'email2@test.com', label: 'Test 2' }
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

	describe('ContactInput', () => {
		it('should display edit action when new value in ContactInput has an error', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			jest.spyOn(shellUi, 'useIntegratedComponent').mockReturnValue([ContactInputError, true]);
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {}
				}
			});
			const { user } = setupTest(<EditorAttendees editorId={editor.id} />, { store });
			const testButton = await screen.findByTestId('test-button');
			await user.click(testButton);

			await waitFor(() => {
				expect(spyDefaultValue).toHaveBeenCalledWith(
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
					folders: {}
				}
			});
			const { user } = setupTest(<EditorAttendees editorId={editor.id} />, { store });
			const testButton = await screen.findByTestId('test-button');
			await user.click(testButton);

			await waitFor(() => {
				expect(spyDefaultValue).toHaveBeenCalledWith(
					expect.arrayContaining([
						expect.objectContaining({
							error: false,
							actions: []
						})
					])
				);
			});
		});

		it('should pass firstName, lastName as undefined to the ContactInput component', async () => {
			jest.spyOn(shellUi, 'useIntegratedComponent').mockReturnValue([ContactInput, true]);
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					attendees: [{ email: 'email1@test.com', fullName: 'Test 1' }]
				}
			});
			setupTest(<EditorAttendees editorId={editor.id} />, { store });

			expect(spyDefaultValue).toHaveBeenCalledWith([
				{
					fullName: 'Test 1',
					email: 'email1@test.com',
					actions: undefined,
					error: undefined,
					firstName: undefined,
					lastName: undefined,
					id: 'email1@test.com'
				}
			]);
		});

		it('should add attendee not available action when already busy during current appointment', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			jest.spyOn(shellUi, 'useIntegratedComponent').mockReturnValue([ContactInput, true]);
			const attendeeEmail = 'email1@test.com';
			const appointmentStart = new Date(2024, 10, 1, 10, 30);
			const appointmentEnd = new Date(2024, 10, 1, 12, 30);
			const shareInfoInterceptor = mockGetShareInfo();
			const freeBusyInterceptor = mockFreeBusyResponse([
				{
					id: attendeeEmail,
					b: [
						{
							s: new Date(2024, 10, 1, 11, 0).getTime(),
							e: new Date(2024, 10, 1, 11, 130).getTime()
						}
					]
				}
			]);
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					start: appointmentStart.getTime(),
					end: appointmentEnd.getTime(),
					attendees: [{ email: attendeeEmail }]
				}
			});
			setupTest(<EditorAttendees editorId={editor.id} />, { store });

			await freeBusyInterceptor;
			await shareInfoInterceptor;
			await waitFor(() => {
				expect(spyDefaultValue).toHaveBeenCalledWith(
					expect.arrayContaining([
						expect.objectContaining({
							actions: [
								{
									id: 'unavailable',
									label: 'Attendee not available at the selected time of the event',
									color: 'error',
									type: 'icon',
									icon: 'AlertTriangle'
								}
							]
						})
					])
				);
			});
		});

		it('should display a contact group', async () => {
			jest.spyOn(shellUi, 'useIntegratedComponent').mockReturnValue([ContactInputGroup, true]);
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {}
				}
			});
			const { user } = setupTest(<EditorAttendees editorId={editor.id} />, { store });

			const testButton = await screen.findByTestId('test-button');
			await user.click(testButton);

			await waitFor(() => {
				expect(spyDefaultValue).toHaveBeenCalledWith(
					expect.arrayContaining([
						expect.objectContaining({
							id: '123',
							email: undefined,
							error: false,
							actions: [],
							isGroup: true,
							groupId: '456',
							display: 'group 456'
						})
					])
				);
			});
		});

		it('should display a distribution list', async () => {
			jest
				.spyOn(shellUi, 'useIntegratedComponent')
				.mockReturnValue([ContactInputDistributionList, true]);
			const store = configureStore({ reducer: combineReducers(reducers) });
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {}
				}
			});
			const { user } = setupTest(<EditorAttendees editorId={editor.id} />, { store });

			const testButton = await screen.findByTestId('test-button');
			await user.click(testButton);

			await waitFor(() => {
				expect(spyDefaultValue).toHaveBeenCalledWith(
					expect.arrayContaining([
						expect.objectContaining({
							company: undefined,
							display: undefined,
							email: 'prova@zextras.com',
							error: false,
							firstName: undefined,
							fullName: 'DL di test',
							groupId: undefined,
							id: 'undefined prova@zextras.com',
							isGroup: true,
							label: 'prova@zextras.com',
							lastName: undefined,
							actions: []
						})
					])
				);
			});
		});
	});
});
