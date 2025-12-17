/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { screen, waitFor, within } from '@testing-library/react';
import { CONTACT_TYPES, DefaultContactInput, useContactInput } from '@zextras/carbonio-ui-commons';
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
import { mockFreeBusyResponse, mockGetShareInfo } from '../../../../soap/tests/mocks';
import { reducers } from '../../../../store/redux';
import { EditorAttendees } from '../editor-attendees';
import { setupTest } from '@test-setup';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { buildSoapErrorResponseBody } from '@test-utils/utils/soap';

vi.mock('@zextras/carbonio-ui-commons', async () => ({
	...(await vi.importActual('@zextras/carbonio-ui-commons')),
	useContactInput: vi.fn()
}));

beforeEach(() => {
	vi.setSystemTime(new Date('1970-01-01T00:00:00.000Z'));
});

describe('Editor Attendees', () => {
	beforeEach(() => {
		(useContactInput as Mock).mockReturnValue(DefaultContactInput);
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
		await waitFor(async () => {
			expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
		});
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
						e: new Date(2024, 10, 1, 11, 30).getTime()
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
		it('should display attendee label when available', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					attendees: [{ email: 'email1@test.com', label: 'test label' }]
				}
			});
			setupTest(<EditorAttendees editorId={editor.id} />, { store });
			expect(within(screen.getByTestId('chip')).getByText('test label')).toBeVisible();
		});

		it('should display attendee email when label is not available', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					attendees: [{ email: 'email1@test.com' }]
				}
			});
			setupTest(<EditorAttendees editorId={editor.id} />, { store });
			expect(within(screen.getByTestId('chip')).getByText('email1@test.com')).toBeVisible();
		});

		it('should display multiple attendees', () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					attendees: [{ email: 'email1@test.com' }, { email: 'email2@test.com' }]
				}
			});
			setupTest(<EditorAttendees editorId={editor.id} />, { store });

			const chips = screen.getAllByTestId('chip');

			expect(within(chips[0]).getByText('email1@test.com')).toBeVisible();
			expect(within(chips[1]).getByText('email2@test.com')).toBeVisible();
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
			const chipInput = await screen.findByTestId('attendees-chip-input');

			await user.type(within(chipInput).getByRole('textbox'), 'email3@test.com');
			await user.type(within(chipInput).getByRole('textbox'), '[Enter]');

			expect(within(screen.getByTestId('chip')).getByText('email3@test.com')).toBeVisible();
		});

		it('should not clear existing attendees after adding a new one', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					attendees: [{ email: 'email1@test.com' }, { email: 'email2@test.com' }]
				}
			});
			const { user } = setupTest(<EditorAttendees editorId={editor.id} />, { store });
			const chipInput = await screen.findByTestId('attendees-chip-input');

			await user.type(within(chipInput).getByRole('textbox'), 'email3@test.com');
			await user.type(within(chipInput).getByRole('textbox'), '[Enter]');

			const chips = screen.getAllByTestId('chip');

			expect(within(chips[0]).getByText('email1@test.com')).toBeVisible();
			expect(within(chips[1]).getByText('email2@test.com')).toBeVisible();
			expect(within(chips[2]).getByText('email3@test.com')).toBeVisible();
		});
	});

	describe('ContactInput', () => {
		it('should display edit action when new value in ContactInput has an error', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			const newValueFromAutocomplete = { ...MOCK_VALUE, actions: [EDIT_ACTION], error: true };

			(useContactInput as Mock).mockReturnValue(
				contactInputBuilder({ valuesToAdd: [newValueFromAutocomplete] })
			);
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {}
				}
			});
			const { user } = setupTest(<EditorAttendees editorId={editor.id} />, { store });

			await triggerOnAdd(user);

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

		it('should display attendee not available action when already busy during current appointment', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			(useContactInput as Mock).mockReturnValue(contactInputBuilder());
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
					attendees: [{ email: attendeeEmail, ptst: PARTICIPATION_STATUS.ACCEPTED }]
				}
			});
			const { user } = setupTest(<EditorAttendees editorId={editor.id} />, { store });

			await triggerOnAdd(user);

			expect(spyDefaultValue).toHaveBeenCalledWith([
				expect.objectContaining({ label: attendeeEmail }),
				expect.objectContaining({ label: 'test label' })
			]);

			expect(store.getState().editor.editors[editor.id].attendees[0].ptst).toBe(
				PARTICIPATION_STATUS.ACCEPTED
			);
		});

		it('should display a distribution list from store as distribution list', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			(useContactInput as Mock).mockReturnValue(contactInputBuilder());
			const dlEmail = 'dl1@test.com';
			const editor = generateEditor({
				context: {
					dispatch: store.dispatch,
					folders: {},
					attendees: [{ email: dlEmail, isGroup: true }]
				}
			});
			setupTest(<EditorAttendees editorId={editor.id} />, { store });

			await waitFor(() => {
				expect(spyDefaultValue).toHaveBeenCalledWith(
					expect.arrayContaining([
						expect.objectContaining({
							id: dlEmail,
							label: dlEmail,
							value: {
								id: dlEmail,
								email: dlEmail,
								type: CONTACT_TYPES.DISTRIBUTION_LIST
							}
						})
					])
				);
			});
		});
	});
});
