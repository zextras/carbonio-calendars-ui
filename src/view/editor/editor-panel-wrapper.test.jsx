/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { screen } from '@testing-library/react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { faker } from '@faker-js/faker';
import { head, last } from 'lodash';
import moment from 'moment';
import EditorPanelWrapper from './editor-panel-wrapper';
import {
	generateCalendarSliceItem,
	generateEditorSliceItem,
	getRandomEditorId,
	getRandomInRange,
	mockEmptyStore
} from '../../test/generators/generators';
import { reducers } from '../../store/redux';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import * as shell from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { createEmptyEditor } from '../../commons/editor-generator';
import { PREFS_DEFAULTS } from '../../constants';

jest.setTimeout(50000);

shell.getUserSettings.mockImplementation(() => ({
	prefs: {
		zimbraPrefTimeZoneId: 'Europe/Berlin',
		zimbraPrefCalendarDefaultApptDuration: '60m',
		zimbraPrefCalendarApptReminderWarningTime: '5',
		zimbraPrefDefaultCalendarId: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	}
}));

const getIdentity = () => ({
	firstName: faker?.name?.firstName?.() ?? '',
	lastName: faker?.name?.lastName?.() ?? ''
});

const identity1 = getIdentity();
const identity2 = getIdentity();
const identity3 = getIdentity();

const identity1Name = `${identity1.firstName} ${identity1.lastName}`;
const identityRegex = new RegExp(identity1Name, 'i');

const defaultIdentityName = 'DEFAULT identity';
const defaultIdentityRegex = new RegExp(defaultIdentityName, 'i');

const defaultCalendar = 'Calendar';
const defaultCalendarRegex = new RegExp(defaultCalendar, 'i');

export const userAccount = {
	identities: {
		identity: [
			{
				id: '1',
				name: 'DEFAULT',
				_attrs: {
					zimbraPrefFromAddressType: faker?.internet?.email?.() ?? '',
					zimbraPrefIdentityName: defaultIdentityName
				}
			},
			{
				id: '2',
				name: identity1Name,
				_attrs: {
					zimbraPrefFromAddressType:
						faker?.internet?.email?.(identity1.firstName, identity1.lastName) ?? '',
					zimbraPrefIdentityName: identity1Name
				}
			}
		]
	}
};

shell.useUserAccount.mockImplementation(() => userAccount);
shell.getUserAccount.mockImplementation(() => userAccount);

const folders = [
	{
		absFolderPath: '/Calendar',
		acl: undefined,
		activesyncdisabled: false,
		children: [],
		color: {
			color: getRandomInRange(0, 8)
		},
		deletable: false,
		depth: 1,
		f: '#',
		i4ms: 6046,
		i4n: undefined,
		i4next: 396,
		i4u: undefined,
		id: '10',
		isLink: false,
		l: '1',
		luuid: 'b9483716-91e9-4ecf-a594-344185f17ac9',
		md: undefined,
		meta: undefined,
		ms: 1,
		n: 4,
		name: 'Calendar',
		perm: undefined,
		recursive: false,
		rest: undefined,
		retentionPolicy: undefined,
		rev: 1,
		rgb: undefined,
		s: 0,
		u: undefined,
		url: undefined,
		uuid: '365f04ec-2c8d-4ef0-9998-a23e94a85725',
		view: 'appointment',
		webOfflineSyncDays: 0
	},
	{
		absFolderPath: '/Test',
		acl: undefined,
		activesyncdisabled: false,
		children: [],
		color: {
			color: getRandomInRange(0, 8)
		},
		deletable: false,
		depth: 1,
		f: '#',
		i4ms: 6046,
		i4n: undefined,
		i4next: 396,
		i4u: undefined,
		id: '5',
		isLink: false,
		l: '1',
		luuid: 'b9483716-91e9-4ecf-a594-344185f17ac8',
		md: undefined,
		meta: undefined,
		ms: 1,
		n: 4,
		name: 'Test',
		perm: undefined,
		recursive: false,
		rest: undefined,
		retentionPolicy: undefined,
		rev: 1,
		rgb: undefined,
		s: 0,
		u: undefined,
		url: undefined,
		uuid: '365f04ec-2c8d-4ef0-9998-a23e94a85726',
		view: 'appointment',
		webOfflineSyncDays: 0
	}
];

export const getEditor = (editorId = getRandomEditorId(false), context = {}) => {
	const editor = createEmptyEditor(editorId, folders);
	return {
		...editor,
		...context
	};
};

describe('Editor panel wrapper', () => {
	shell.useIntegratedComponent.mockImplementation(jest.fn(() => [undefined, false]));

	test('it doesnt render without editorId or callbacks', () => {
		const emptyStore = mockEmptyStore();

		const store = configureStore({
			reducer: combineReducers(reducers),
			preloadedState: emptyStore
		});
		setupTest(<EditorPanelWrapper />, { store });
		expect(screen.queryByTestId('EditorPanel')).not.toBeInTheDocument();
		expect(screen.queryByTestId('EditorBackgroundContainer')).not.toBeInTheDocument();
		expect(screen.queryByTestId('AppointmentCardContainer')).not.toBeInTheDocument();
		expect(screen.queryByTestId('EditorHeader')).not.toBeInTheDocument();
	});
	describe('it renders with editorId and callbacks', () => {
		test('toggle expand action', async () => {
			const isNew = false;
			const editorId = getRandomEditorId(isNew);
			const calendars = {
				calendars: generateCalendarSliceItem()
			};
			const editor = getEditor(editorId);
			const editorSlice = {
				activeId: editorId,
				editors: generateEditorSliceItem({ editor })
			};

			const emptyStore = mockEmptyStore({ calendars, editor: editorSlice });

			const store = configureStore({
				reducer: combineReducers(reducers),
				preloadedState: emptyStore
			});

			const { user } = setupTest(<EditorPanelWrapper />, { store });
			await user.click(screen.getByTestId('expand'));

			expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
			expect(screen.getByTestId('EditorBackgroundContainer')).toBeInTheDocument();
			expect(screen.getByTestId('AppointmentCardContainer')).toBeInTheDocument();
			expect(screen.getByTestId('EditorHeader')).toBeInTheDocument();

			await user.click(screen.getByTestId('expand'));

			expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
			expect(screen.queryByTestId('EditorBackgroundContainer')).not.toBeInTheDocument();
			expect(screen.getByTestId('AppointmentCardContainer')).toBeInTheDocument();
			expect(screen.getByTestId('EditorHeader')).toBeInTheDocument();
		});
		test('create an appointment with default values', async () => {
			const module = {
				createSnackbar: jest.fn()
			};

			shell.getBridgedFunctions.mockImplementation(() => module);

			const snackbarSpy = jest.spyOn(module, 'createSnackbar');

			const isNew = true;
			const editorId = getRandomEditorId(isNew);
			const editor = getEditor(editorId);
			const calendars = {
				calendars: generateCalendarSliceItem({ folders })
			};
			const editorSlice = {
				activeId: editorId,
				editors: generateEditorSliceItem({ editor })
			};
			const emptyStore = mockEmptyStore({ calendars, editor: editorSlice });

			const store = configureStore({
				reducer: combineReducers(reducers),
				preloadedState: emptyStore
			});

			const { user } = setupTest(<EditorPanelWrapper />, { store });

			expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();

			expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
			await user.click(screen.getByRole('button', { name: /save/i }));

			const editorState = store.getState().editor.editors[editorId];

			expect(editorState.allDay).toBe(false);
			expect(editorState.attach).toBeUndefined();
			expect(editorState.attachmentFiles).toStrictEqual([]);
			expect(editorState.attendees).toStrictEqual([]);
			expect(editorState.class).toBe('PUB');
			expect(editorState.end).toBe(moment(editorState.start).add('60', 'minutes').valueOf());
			expect(editorState.exceptId).toBeUndefined();
			expect(editorState.freeBusy).toBe('B');
			expect(editorState.id).toBe(editorId);
			expect(editorState.inviteId).toBeDefined();
			expect(editorState.isException).toBe(false);
			expect(editorState.isInstance).toBe(true);
			expect(editorState.isNew).toBe(false);
			expect(editorState.isSeries).toBe(false);
			expect(editorState.location).toBe('');
			expect(editorState.optionalAttendees).toStrictEqual([]);
			expect(editorState.plainText).toBe('');
			expect(editorState.recur).toBeUndefined();
			expect(editorState.reminder).toBe('5');
			expect(editorState.richText).toBe('');
			expect(editorState.room).toBeUndefined();
			expect(editorState.start).toBeLessThanOrEqual(new Date().valueOf());
			expect(editorState.title).toBe('');

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
		test('create an appointment with custom values', async () => {
			const module = {
				createSnackbar: jest.fn()
			};

			shell.getBridgedFunctions.mockImplementation(() => module);
			shell.t.mockImplementation(() => '');

			const snackbarSpy = jest.spyOn(module, 'createSnackbar');

			const isNew = true;
			const editorId = getRandomEditorId(isNew);
			const editor = getEditor(editorId);
			const calendars = {
				calendars: generateCalendarSliceItem({ folders })
			};
			const editorSlice = {
				activeId: editorId,
				editors: generateEditorSliceItem({ editor })
			};
			const emptyStore = mockEmptyStore({ calendars, editor: editorSlice });

			const store = configureStore({
				reducer: combineReducers(reducers),
				preloadedState: emptyStore
			});

			const { user } = setupTest(<EditorPanelWrapper />, { store });

			const attendee = faker?.internet?.email?.(identity2.firstName, identity2.lastName);
			const optionalAttendee = faker?.internet?.email?.(identity3.firstName, identity3.lastName);

			const prevEditorState = store.getState().editor.editors[editorId];

			// ASSERTIONS ON EDITOR DEFAULT VALUES
			expect(prevEditorState.freeBusy).toBe('B');
			expect(prevEditorState.organizer.label).toBe('DEFAULT identity');
			expect(prevEditorState.calendar.name).toBe('Calendar');
			expect(prevEditorState.reminder).toBe('5');
			expect(prevEditorState.recur).toBeUndefined();

			// USER INTERACTIONS ON EDITOR FIELDS
			await user.click(screen.getByText(defaultIdentityRegex));
			await user.click(screen.getByText(identityRegex));

			const newTitle = faker.random.word();
			const newLocation = faker.random.word();

			await user.type(
				screen.getByRole('textbox', {
					name: /Event title/i
				}),
				newTitle
			);

			await user.type(
				screen.getByRole('textbox', {
					name: /Location/i
				}),
				newLocation
			);

			await user.click(screen.getByText(/busy/i));
			await user.click(screen.getByText(/free/i));

			expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
			// testing attendees and optional attendees chipinput instead of integrations
			await user.type(screen.getByRole('textbox', { name: /attendees/i }), attendee);
			await user.type(screen.getByRole('textbox', { name: /attendees/i }), '{space}');
			// await user.click(screen.getByText(/optionals/i));
			await user.click(screen.getByRole('button', { name: /optionals/i }));
			await user.type(screen.getByRole('textbox', { name: /optionals/i }), optionalAttendee);
			await user.type(screen.getByRole('textbox', { name: /optionals/i }), '{space}');

			// this is really unstable and a better solution must be found
			const allCheckboxes = screen.getAllByTestId('icon: Square');
			const privateCheckbox = head(allCheckboxes);
			const allDayCheckbox = last(allCheckboxes);

			await user.click(privateCheckbox);
			await user.click(allDayCheckbox);

			await user.click(screen.getByText(defaultCalendarRegex));
			await user.click(screen.getByText(/Test/i));

			await user.click(screen.getByText(/reminder/i));
			await user.click(screen.getByText(/1 minute before/i));

			await user.click(screen.getByText(/repeat/i));
			await user.click(screen.getByText(/every day/i));
			// DEBOUNCE TIMER FOR INPUT FIELDS
			jest.advanceTimersByTime(500);

			expect(screen.getByRole('button', { name: /send/i })).toBeEnabled();
			await user.click(screen.getByRole('button', { name: /send/i }));

			const editorState = store.getState().editor.editors[editorId];

			// ASSERTIONS ON EDITOR NEW VALUES
			expect(editorState.organizer.label).toBe(identity1Name);
			expect(editorState.title).toBe(newTitle);
			expect(editorState.location).toBe(newLocation);
			expect(editorState.freeBusy).toBe('F');

			// This is commented due to a bug which must be fixed inside the calendar selector
			// expect(editorState.calendar.name).toBe('Test');

			// check if both checkboxes have different icon after clicking on them
			expect(screen.getAllByTestId('icon: CheckmarkSquare')).toHaveLength(2);

			// check editor checkboxes effective values after clicking on them
			expect(editorState.class).toBe('PRI');
			expect(editorState.allDay).toBe(true);

			expect(editorState.attendees).toStrictEqual([{ label: attendee }]);
			expect(editorState.optionalAttendees).toStrictEqual([{ label: optionalAttendee }]);
			expect(editorState.reminder).toBe('1');
			expect(editorState.recur[0].add[0].rule[0].freq).toBe('DAI');
			expect(editorState.recur[0].add[0].rule[0].interval.ival).toBe(1);

			// asserting the new editor values when appointment has been successfully sent
			expect(editorState.isSeries).toBe(true);
			expect(editorState.isInstance).toBe(false);
			expect(editorState.isNew).toBe(false);
			expect(editorState.isException).toBe(false);
			expect(snackbarSpy).toHaveBeenCalledTimes(1);
			expect(snackbarSpy).toHaveBeenCalledWith({
				autoHideTimeout: 3000,
				hideButton: true,
				key: 'calendar-moved-root',
				label: 'Appointment invitation sent',
				replace: true,
				type: 'info'
			});
		});
	});
	shell.useIntegratedComponent.mockClear();
});
