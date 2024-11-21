/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect } from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { screen, waitFor, within } from '@testing-library/react';
import { Button } from '@zextras/carbonio-design-system';
import * as shellUi from '@zextras/carbonio-shell-ui';
import { combineReducers } from 'redux';

import { createSoapAPIInterceptor } from '../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { buildSoapErrorResponseBody } from '../../../../carbonio-ui-commons/test/mocks/utils/soap';
import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../../commons/editor-generator';
import { mockFreeBusyResponse, mockGetShareInfo } from '../../../../soap/tests/mocks';
import { reducers } from '../../../../store/redux';
import { EditorAttendees } from '../editor-attendees';

const spyDefaultValue = jest.fn();
const editAction = { icon: 'EditOutline', id: 'edit', label: 'Edit', type: 'edit' };
const valuesWithError = [
	{
		id: '123',
		label: 'whatever',
		email: 'newContact@test.com',
		firstName: 'New',
		lastName: 'Contact',
		fullName: 'New Contact',
		error: true,
		actions: [editAction]
	}
];

const valuesWithoutError = [
	{
		id: '123',
		label: 'whatever',
		email: 'newContact@test.com',
		firstName: 'New',
		lastName: 'Contact',
		fullName: 'New Contact',
		error: false,
		actions: [editAction]
	}
];

function ContactInput(props: Record<string, any>): React.JSX.Element {
	useEffect(() => {
		spyDefaultValue(props.defaultValue);
	}, [props.defaultValue]);

	return (
		<Button onClick={(): void => props.onChange(valuesWithoutError)} data-testid={'test-button'} />
	);
}

function ContactInputError(props: Record<string, any>): React.JSX.Element {
	useEffect(() => {
		spyDefaultValue(props.defaultValue);
	}, [props.defaultValue]);

	return (
		<Button onClick={(): void => props.onChange(valuesWithError)} data-testid={'test-button'}>
			{props.value}
		</Button>
	);
}

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

	describe('Attendees', () => {
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
					expect(spyDefaultValue).toBeCalledWith(
						expect.arrayContaining([
							expect.objectContaining({
								error: true,
								actions: [editAction]
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
						id: undefined
					}
				]);
			});
		});
	});

	describe('Optional Attendees', () => {
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

				setupTest(<EditorAttendees editorId={editor.id} />, { store });

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
				const { user } = setupTest(<EditorAttendees editorId={editor.id} />, { store });
				const chipInput = await screen.findByTestId('optional-attendees-chip-input');
				const attendees = await screen.findAllByText('Attendees');

				await user.type(within(chipInput).getByRole('textbox'), 'email3@test.com');
				await user.click(attendees[0]);

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

				setupTest(<EditorAttendees editorId={editor.id} />, { store });

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
				setupTest(<EditorAttendees editorId={editor.id} />, { store });

				expect(screen.getByText('email1@test.com')).toBeVisible();
			});
		});
	});
});
