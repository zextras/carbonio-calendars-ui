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

// todo: datePicker render is very slow
jest.setTimeout(200000);

shell.getUserSettings.mockImplementation(() => ({
	prefs: {
		zimbraPrefTimeZoneId: 'Europe/Berlin',
		zimbraPrefCalendarDefaultApptDuration: '60m',
		zimbraPrefCalendarApptReminderWarningTime: '5',
		zimbraPrefDefaultCalendarId: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	}
}));

const identity1 = {
	firstName: faker?.name?.firstName?.() ?? '',
	lastName: faker?.name?.lastName?.() ?? ''
};

const identity1Name = `${identity1.firstName} ${identity1.lastName}`;
const identityRegex = new RegExp(identity1Name, 'i');

const defaultIdentityName = 'DEFAULT identity';
const defaultIdentityRegex = new RegExp(defaultIdentityName, 'i');

const defaultCalendar = 'Calendar';
const defaultCalendarRegex = new RegExp(defaultCalendar, 'i');

const userAccount = {
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
			// screen.debug();
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
		test('create an appointment', async () => {
			const isNew = false;
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

			// ASSERTIONS ON EDITOR DEFAULT VALUES
			expect(store.getState().editor.editors[editorId].freeBusy).toBe('B');
			expect(store.getState().editor.editors[editorId].organizer.label).toBe('DEFAULT identity');
			expect(store.getState().editor.editors[editorId].calendar.name).toBe('Calendar');

			// USER INTERACTIONS ON EDITOR FIELDS
			await user.click(screen.getByText(defaultIdentityRegex));
			await user.click(screen.getByText(identityRegex));

			const newTitle = faker.random.word();
			const newLocation = faker.random.word();

			await user.click(
				screen.getByRole('textbox', {
					name: /Event title/i
				})
			);
			await user.type(
				screen.getByRole('textbox', {
					name: /Event title/i
				}),
				newTitle
			);

			await user.click(
				screen.getByRole('textbox', {
					name: /Location/i
				})
			);

			await user.type(
				screen.getByRole('textbox', {
					name: /Location/i
				}),
				newLocation
			);

			await user.click(screen.getByText(/busy/i));
			await user.click(screen.getByText(/free/i));

			// this is really unstable and a better solution must be found
			const allCheckboxes = screen.getAllByTestId('icon: Square');
			const privateCheckbox = head(allCheckboxes);
			const allDayCheckbox = last(allCheckboxes);

			await user.click(privateCheckbox);
			await user.click(allDayCheckbox);

			await user.click(screen.getByText(defaultCalendarRegex));
			await user.click(screen.getByText(/Test/i));

			// DEBOUNCE TIMER FOR INPUT FIELDS
			jest.advanceTimersByTime(500);

			// ASSERTIONS ON EDITOR NEW VALUES
			expect(store.getState().editor.editors[editorId].organizer.label).toBe(identity1Name);
			expect(store.getState().editor.editors[editorId].title).toBe(newTitle);
			expect(store.getState().editor.editors[editorId].location).toBe(newLocation);
			expect(store.getState().editor.editors[editorId].freeBusy).toBe('F');

			// This is commented due to a bug which must be fixed inside the calendar selector
			// expect(store.getState().editor.editors[editorId].calendar.name).toBe('Test');

			// check if both checkboxes have different icon after clicking on them
			expect(screen.getAllByTestId('icon: CheckmarkSquare')).toHaveLength(2);

			// check editor checkboxes effective values after clicking on them
			expect(store.getState().editor.editors[editorId].class).toBe('PRI');
			expect(store.getState().editor.editors[editorId].allDay).toBe(true);
		});
	});
});
