/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, waitFor } from '@testing-library/react';
import { map, values } from 'lodash';
import { rest } from 'msw';
import React from 'react';
import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import {
	createFakeIdentity,
	getMockedAccountItem
} from '../../carbonio-ui-commons/test/mocks/accounts/fakeAccounts';
import * as shell from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import defaultSettings from '../../carbonio-ui-commons/test/mocks/settings/default-settings';
import { setupHook, setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { PREFS_DEFAULTS } from '../../constants';
import { useOnClickNewButton } from '../../hooks/on-click-new-button';
import { reducers } from '../../store/redux';
import BoardEditPanel from '../../view/editor/editor-board-wrapper';
import mockedData from '../generators';

jest.setTimeout(30000);

shell.getUserSettings.mockImplementation(() => ({
	...defaultSettings,
	prefs: {
		...defaultSettings.prefs,
		zimbraPrefUseTimeZoneListInCalendar: 'TRUE',
		zimbraPrefTimeZoneId: 'Europe/Berlin',
		zimbraPrefCalendarDefaultApptDuration: '60m',
		zimbraPrefCalendarApptReminderWarningTime: '5',
		zimbraPrefDefaultCalendarId: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	}
}));

describe('create single appointment with default values', () => {
	test('from board panel', async () => {
		// SETUP MOCKS, STORE AND HOOK
		const store = configureStore({ reducer: combineReducers(reducers) });
		const { result } = setupHook(useOnClickNewButton, { store });
		const newTitle = faker.random.word();

		// CREATE APPOINTMENT FROM CREATE NEW APPOINTMENT BUTTON FUNCTION
		expect(store.getState().editor.editors).toEqual({});
		await result.current();
		const previousEditor = values(store.getState().editor.editors)[0];
		expect(previousEditor).toBeDefined();

		shell.useBoard.mockImplementation(() => ({
			...previousEditor,
			dispatch: store.dispatch
		}));

		// RENDER BOARD PANEL
		const { user } = setupTest(<BoardEditPanel />, { store });
		expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
		expect(previousEditor.isNew).toEqual(true);

		const titleSelector = screen.getByRole('textbox', { name: /Event title/i });
		await user.type(titleSelector, newTitle);

		// DEBOUNCE TIMER FOR INPUT FIELDS
		jest.advanceTimersByTime(500);

		await waitFor(() => {
			// CHECKING IF EDITOR IS UPDATED AFTER CREATE APPOINTMENT SUCCESSFUL REQUEST
			user.click(screen.getByRole('button', { name: /save/i }));
		});
		const updatedEditor = values(store.getState().editor.editors)[0];
		expect(updatedEditor.isNew).toEqual(false);

		const snackbar = screen.getByText(/edits saved correctly/i);

		expect(snackbar).toBeInTheDocument();
	});
});
describe('create single appointment with custom values', () => {
	test('from board panel', async () => {
		// SETUP MOCKS, STORE AND HOOK
		const store = configureStore({ reducer: combineReducers(reducers) });
		const { result } = setupHook(useOnClickNewButton, { store });

		// CREATE APPOINTMENT FROM CREATE NEW APPOINTMENT BUTTON FUNCTION
		expect(store.getState().editor.editors).toEqual({});
		await result.current();
		const previousEditor = values(store.getState().editor.editors)[0];
		expect(previousEditor).toBeDefined();

		shell.useBoard.mockImplementation(() => ({
			...previousEditor,
			dispatch: store.dispatch
		}));

		// MOCKING DATA FOR TEST
		const newAttendees = map(mockedData.editor.getRandomAttendees(), 'email');
		const newOptionals = map(mockedData.editor.getRandomAttendees(), 'email');
		const identity2 = createFakeIdentity();

		const userAccount = getMockedAccountItem({ identity1: previousEditor.organizer, identity2 });

		shell.useUserAccount.mockImplementation(() => userAccount);
		shell.getUserAccount.mockImplementation(() => userAccount);

		// RENDER BOARD PANEL
		const { user } = setupTest(<BoardEditPanel />, { store });
		expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
		expect(previousEditor.isNew).toEqual(true);

		// SETTING EDITOR NEW VALUES
		const newTitle = faker.random.word();
		const newLocation = faker.random.word();
		const newAttendeesInput = newAttendees.join(' ');
		const newOptionalsInput = newOptionals.join(' ');

		getSetupServer().use(
			rest.post('/service/soap/getFreeBusyRequest', async (req, res, ctx) =>
				res(
					ctx.json({
						Header: {
							context: {
								session: { id: 191337, _content: 191337 }
							}
						},
						Body: {
							GetFreeBusyResponse: { usr: map(newAttendees, (attendee) => ({ id: attendee })) }
						}
					})
				)
			)
		);

		// SETTING NEW ORGANIZER
		await user.click(screen.getByText(new RegExp(previousEditor.organizer.fullName, 'i')));
		await user.click(screen.getByText(new RegExp(identity2.fullName, 'i')));

		// SETTING NEW TITLE, LOCATION, FREEBUSY
		const titleSelector = screen.getByRole('textbox', { name: /Event title/i });
		const locationSelector = screen.getByRole('textbox', { name: /Location/i });
		await user.type(titleSelector, newTitle);
		await user.type(locationSelector, newLocation);
		await user.click(screen.getByText(/busy/i));

		// SETTING ATTENDEES AND OPTIONAL ATTENDEES
		await waitFor(() => {
			user.type(screen.getByRole('textbox', { name: /attendees/i }), newAttendeesInput);
		});

		await waitFor(() => {
			user.click(screen.getByRole('button', { name: /optionals/i }));
		});

		await waitFor(() => {
			user.type(screen.getByRole('textbox', { name: 'Optionals' }), newOptionalsInput);
		});

		// SETTING PRIVATE AND ALLDAY
		// todo: this is really unstable and a better solution must be found
		const allCheckboxes = screen.getAllByTestId('icon: Square');
		const privateCheckbox = allCheckboxes[0];
		const allDayCheckbox = allCheckboxes[1];
		await user.click(privateCheckbox);
		await user.click(allDayCheckbox);

		// SELECTING DIFFERENT REMINDER VALUE
		await user.click(screen.getByText(/reminder/i));
		await user.click(screen.getByText(/1 minute before/i));

		// DEBOUNCE TIMER FOR INPUT FIELDS
		jest.advanceTimersByTime(500);

		await waitFor(() => {
			// CHECKING IF EDITOR IS UPDATED AFTER CREATE APPOINTMENT SUCCESSFUL REQUEST
			user.click(screen.getByRole('button', { name: /save/i }));
		});

		const updatedEditor = values(store.getState().editor.editors)[0];
		expect(updatedEditor.isNew).toEqual(false);

		const snackbar = screen.getByText(/edits saved correctly/i);

		expect(snackbar).toBeInTheDocument();
	});
});
