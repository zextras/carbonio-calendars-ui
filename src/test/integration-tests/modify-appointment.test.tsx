import { faker } from '@faker-js/faker';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { map, values } from 'lodash';
import React from 'react';
import { getByRole, screen } from '@testing-library/react';
import { editAppointment } from '../../actions/appointment-actions-fn';
import * as shell from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { PREFS_DEFAULTS } from '../../constants';
import { reducers } from '../../store/redux';
import { PanelView } from '../../types/actions';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import EditorPanelWrapper from '../../view/editor/editor-panel-wrapper';
import mockedData from '../generators';

jest.setTimeout(250000);

shell.getUserSettings.mockImplementation(() => ({
	prefs: {
		zimbraPrefTimeZoneId: 'Europe/Berlin',
		zimbraPrefCalendarDefaultApptDuration: '60m',
		zimbraPrefCalendarApptReminderWarningTime: '5',
		zimbraPrefDefaultCalendarId: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	}
}));

describe('modify appointment', () => {
	test('single', async () => {
		// SETUP MOCKS AND STORE
		const module = { createSnackbar: jest.fn() };
		shell.getBridgedFunctions.mockImplementation(() => module);
		const snackbarSpy = jest.spyOn(module, 'createSnackbar');
		const event = mockedData.getEvent();
		const invite = mockedData.getInvite({ event });
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
		expect(previousEditor.start).toEqual(1640995200000);
		expect(previousEditor.end).toEqual(1640997000000);

		// SETTING EDITOR NEW VALUES
		const newAttendees = map(mockedData.editor.getRandomAttendees(), 'email');
		const newOptionals = map(mockedData.editor.getRandomAttendees(), 'email');
		const newTitle = faker.random.word();
		const newLocation = faker.random.word();
		const newAttendeesInput = newAttendees.join(' ');
		const newOptionalsInput = newOptionals.join(' ');

		// SETTING NEW TITLE, LOCATION, FREEBUSY
		const titleSelector = screen.getByRole('textbox', { name: /Event title/i });
		const locationSelector = screen.getByRole('textbox', { name: /Location/i });
		await user.type(titleSelector, newTitle);
		await user.type(locationSelector, newLocation);
		await user.click(screen.getByText(/free/i));

		// SETTING ATTENDEES AND OPTIONAL ATTENDEES
		await user.type(screen.getByRole('textbox', { name: /attendees/i }), newAttendeesInput);
		await user.click(screen.getByRole('button', { name: /optionals/i }));
		await user.type(screen.getByRole('textbox', { name: /optionals/i }), newOptionalsInput);

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
		await user.click(screen.getByText(/reminder/i));
		await user.click(screen.getByText(/1 minute before/i));

		// DEBOUNCE TIMER FOR INPUT FIELDS
		jest.advanceTimersByTime(500);

		// CHECKING IF EDITOR IS UPDATED AFTER CREATE APPOINTMENT SUCCESSFUL REQUEST
		await user.click(screen.getByRole('button', { name: /save/i }));

		const updatedEditor = values(store.getState().editor.editors)[0];
		expect(updatedEditor.isNew).toEqual(false);
		expect(updatedEditor.start).toEqual(1641157200000);
		expect(updatedEditor.end).toEqual(1641159000000);
		expect(updatedEditor.attendees).toHaveLength(newAttendees.length);
		expect(updatedEditor.optionalAttendees).toHaveLength(newOptionals.length);

		// SNACKBAR DISPLAY CORRECTLY
		expect(snackbarSpy).toHaveBeenCalledTimes(1);
		expect(snackbarSpy).toHaveBeenCalledWith({
			autoHideTimeout: 3000,
			hideButton: true,
			key: 'calendar-moved-root',
			label: 'Edits saved correctly',
			replace: true,
			type: 'info'
		});
	});
});
