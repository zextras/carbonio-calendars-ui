/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect } from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { screen, within } from '@testing-library/react';
import * as shellUi from '@zextras/carbonio-shell-ui';
import { combineReducers } from 'redux';

import { createSoapAPIInterceptor } from '../../../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { buildSoapErrorResponseBody } from '../../../../carbonio-ui-commons/test/mocks/utils/soap';
import { setupTest } from '../../../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../../../commons/editor-generator';
import { mockFreeBusyResponse, mockGetShareInfo } from '../../../../soap/tests/mocks';
import { reducers } from '../../../../store/redux';
import { EditorAttendees } from '../editor-attendees';

const spyOnAddReturnValue = jest.fn();

const StringOnAddContactInput = (props: Record<string, any>): React.JSX.Element => {
	useEffect(() => {
		spyOnAddReturnValue(props.onAdd('test static'));
	}, [props]);

	return <div data-testid={'attendees-chip-input'}>{props.value}</div>;
};

describe('Editor Attendees', () => {
	beforeEach(() => {
		jest.spyOn(shellUi, 'useIntegratedComponent').mockReturnValue([StringOnAddContactInput, false]);
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

	it('should use string value as label and email onAdd() receives a string', async () => {
		const store = configureStore({ reducer: combineReducers(reducers) });
		jest.spyOn(shellUi, 'useIntegratedComponent').mockReturnValue([StringOnAddContactInput, true]);
		const editor = generateEditor({
			context: {
				dispatch: store.dispatch,
				folders: {},
				start: 100,
				end: 200,
				attendees: []
			}
		});

		setupTest(<EditorAttendees editorId={editor.id} />, { store });

		expect(spyOnAddReturnValue).toHaveBeenCalledWith({
			label: 'test static',
			value: { email: 'test static' }
		});
	});

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
	});

	describe('Optional Attendees', () => {
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
