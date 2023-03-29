/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen, waitFor } from '@testing-library/react';
import { t } from '@zextras/carbonio-shell-ui';
import { map, values } from 'lodash';
import React from 'react';
import { editAppointment } from '../../actions/appointment-actions-fn';
import * as shell from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import defaultSettings from '../../carbonio-ui-commons/test/mocks/settings/default-settings';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { PREFS_DEFAULTS } from '../../constants';
import { reducers } from '../../store/redux';
import { PanelView } from '../../types/actions';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import EditorPanelWrapper from '../../view/editor/editor-panel-wrapper';
import mockedData from '../generators';

jest.setTimeout(55000);

shell.getUserSettings.mockImplementation(() => ({
	prefs: {
		zimbraPrefUseTimeZoneListInCalendar: 'TRUE',
		zimbraPrefTimeZoneId: 'Europe/Berlin',
		zimbraPrefCalendarDefaultApptDuration: '60m',
		zimbraPrefCalendarApptReminderWarningTime: '5',
		zimbraPrefDefaultCalendarId: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	},
	props: [...defaultSettings.props],
	attrs: {
		...defaultSettings.attrs
	}
}));

const recurrenceRule = [
	{
		add: [
			{
				rule: [
					{
						freq: 'DAI',
						until: [
							{
								d: '20241210T083000Z'
							}
						],
						interval: [
							{
								ival: 1
							}
						]
					}
				]
			}
		]
	}
];

describe.each`
	title          | seriesResourceEvent                           | recurrence        | exceptId                                         | expected
	${'single'}    | ${{}}                                         | ${undefined}      | ${undefined}                                     | ${mockedData.utils.getSingleEditorFields()}
	${'series'}    | ${mockedData.utils.getSeriesEventFields()}    | ${recurrenceRule} | ${undefined}                                     | ${mockedData.utils.getSeriesEditorFields()}
	${'exception'} | ${mockedData.utils.getExceptionEventFields()} | ${undefined}      | ${undefined}                                     | ${mockedData.utils.getExceptionEditorFields()}
	${'instance'}  | ${mockedData.utils.getInstanceEventFields()}  | ${recurrenceRule} | ${{ d: '20221215T093000', tz: 'Europe/Berlin' }} | ${mockedData.utils.getExceptionEditorFields()}
`('modify appointment', ({ title, seriesResourceEvent, recurrence, exceptId, expected }) => {
	test(`${title} - attendees, optionals, title, location, private, allDay, start, end, reminder`, async () => {
		// SETUP MOCKS AND STORE
		const module = { createSnackbar: jest.fn() };
		shell.getBridgedFunctions.mockImplementation(() => module);
		const snackbarSpy = jest.spyOn(module, 'createSnackbar');
		const event = mockedData.getEvent({ resource: seriesResourceEvent });
		const invite = mockedData.getInvite({ event, context: { recurrenceRule: recurrence } });
		const store = configureStore({ reducer: combineReducers(reducers) });
		const context = {
			panelView: 'app' as PanelView,
			folders: mockedData.calendars.getCalendarsArray(),
			dispatch: store.dispatch
		};

		// CLICK ON EDIT FUNCTION
		const editFn = editAppointment({ event, invite, context });
		await editFn();
		const previousEditor = values(store.getState().editor.editors)[0];
		expect(previousEditor).toBeDefined();
		expect(previousEditor.isNew).toEqual(false);
		expect(store.getState().editor.activeId).toBeDefined();

		const initialEntries = [
			`/calendars/${event.resource.calendar.id}/${EventActionsEnum.EDIT}/${event.resource.id}/${event.resource.ridZ}`
		];

		// RENDER EDITOR PANEL VIEW
		const { user } = setupTest(<EditorPanelWrapper />, { store, initialEntries });

		// CHECKING EDITOR DEFAULT VALUES
		expect(previousEditor.allDay).toEqual(false);

		// SETTING EDITOR NEW VALUES
		const newAttendees = map(mockedData.editor.getRandomAttendees(), 'email');
		const newOptionals = map(mockedData.editor.getRandomAttendees(), 'email');
		const newTitle = faker.random.word();
		const newLocation = faker.random.word();
		const newAttendeesInput = newAttendees.join(' ');
		const newOptionalsInput = newOptionals.join(' ');

		// SETTING NEW TITLE, LOCATION, FREEBUSY
		const titleSelector = screen.getByRole('textbox', {
			name: t('label.event_title', 'Event title')
		});
		const locationSelector = screen.getByRole('textbox', { name: t('label.location', 'Location') });
		await user.type(titleSelector, newTitle);
		await user.type(locationSelector, newLocation);
		await user.click(screen.getByText(/free/i));

		// SETTING ATTENDEES AND OPTIONAL ATTENDEES
		await waitFor(() => {
			user.type(
				screen.getByRole('textbox', { name: t('label.attendee_plural') }),
				newAttendeesInput
			);
		});

		await waitFor(() => {
			user.click(screen.getByRole('button', { name: t('label.optional_plural') }));
		});

		await waitFor(() => {
			user.type(
				screen.getByRole('textbox', { name: t('label.optional_plural') }),
				newOptionalsInput
			);
		});

		// SETTING PRIVATE AND ALLDAY
		// todo: this is really unstable and a better solution must be found
		const allCheckboxes = screen.getAllByTestId('icon: Square');
		const privateCheckbox = allCheckboxes[0];
		const allDayCheckbox = allCheckboxes[1];
		await user.click(privateCheckbox);
		await user.click(allDayCheckbox);

		expect(values(store.getState().editor.editors)[0].allDay).toEqual(true);
		const allChecked = screen.getAllByTestId('icon: CheckmarkSquare');

		await user.click(allChecked[1]);

		expect(values(store.getState().editor.editors)[0].allDay).toEqual(false);

		await user.click(screen.getByTestId('start-picker'));

		await user.click(
			screen.getByRole('option', {
				name: /choose sunday, january 2nd, 2022/i
			})
		);
		await user.click(screen.getByText(/10:00 pm/i));

		// SELECTING DIFFERENT REMINDER VALUE
		await user.click(screen.getByText(t('label.reminder', 'Reminder')));

		const buttonReminder = screen.getByTestId('editor-reminder');
		await user.click(buttonReminder);
		console.log({ buttonReminder });
		await screen.findByText('reminder.minute_before', {});

		// DEBOUNCE TIMER FOR INPUT FIELDS
		jest.advanceTimersByTime(500);

		await waitFor(() => {
			// CHECKING IF EDITOR IS UPDATED AFTER CREATE APPOINTMENT SUCCESSFUL REQUEST
			user.click(screen.getByRole('button', { name: t('label.save') }));
		});

		const updatedEditor = values(store.getState().editor.editors)[0];
		expect(updatedEditor.isNew).toEqual(false);
		expect(updatedEditor.start).toEqual(1641160800000);
		expect(updatedEditor.end).toEqual(1641162600000);
		expect(updatedEditor.attendees).toHaveLength(newAttendees.length);
		expect(updatedEditor.optionalAttendees).toHaveLength(newOptionals.length);

		expect(updatedEditor.isException).toBe(expected.isException);
		expect(updatedEditor.isSeries).toBe(expected.isSeries);
		expect(updatedEditor.isInstance).toBe(expected.isInstance);
		expect(updatedEditor.exceptId).toStrictEqual(exceptId ?? invite.exceptId);
		if (expected.recur) {
			expect(updatedEditor.recur).toBeDefined();
		}

		// SNACKBAR DISPLAY CORRECTLY
		expect(snackbarSpy).toHaveBeenCalledTimes(1);
		expect(snackbarSpy).toHaveBeenCalledWith({
			autoHideTimeout: 3000,
			hideButton: true,
			key: 'calendar-moved-root',
			label: t('message.snackbar.calendar_edits_saved', 'Edits saved correctly'),
			replace: true,
			type: 'info'
		});
	});
});
