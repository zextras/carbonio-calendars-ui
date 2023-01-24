/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { screen } from '@testing-library/react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import EditorPanelWrapper from './editor-panel-wrapper';
import { reducers } from '../../store/redux';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import * as shell from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { PREFS_DEFAULTS } from '../../constants';
import {
	createFakeIdentity,
	getMockedAccountItem
} from '../../carbonio-ui-commons/test/mocks/accounts/fakeAccounts';
import mockedData from '../../test/generators';

jest.setTimeout(50000);

const identity1 = createFakeIdentity();
const identity2 = createFakeIdentity();

const userAccount = getMockedAccountItem({ identity1, identity2 });

shell.useUserAccount.mockImplementation(() => userAccount);
shell.getUserAccount.mockImplementation(() => userAccount);

shell.getUserSettings.mockImplementation(() => ({
	prefs: {
		zimbraPrefUseTimeZoneListInCalendar: 'TRUE',
		zimbraPrefTimeZoneId: 'Europe/Berlin',
		zimbraPrefCalendarDefaultApptDuration: '60m',
		zimbraPrefCalendarApptReminderWarningTime: '5',
		zimbraPrefDefaultCalendarId: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	}
}));

const folder = {
	absFolderPath: '/Test',
	id: '5',
	l: '1',
	name: 'Test',
	view: 'appointment'
};

const folders = mockedData.calendars.getCalendarsArray({ folders: [folder] });

describe('Editor panel wrapper', () => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	shell.useIntegratedComponent.mockImplementation(jest.fn(() => [undefined, false]));

	test('it doesnt render without editorId or callbacks', () => {
		const emptyStore = mockedData.store.mockReduxStore();

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
			const editorId = mockedData.utils.getRandomEditorId(isNew);
			const calendars = {
				calendars: mockedData.store.getCalendarSliceItem()
			};
			const editor = mockedData.editor.getEditor({ editor: { id: editorId }, folders });
			const editorSlice = {
				activeId: editorId,
				editors: mockedData.store.getEditorSliceItem({ editor })
			};

			const emptyStore = mockedData.store.mockReduxStore({ calendars, editor: editorSlice });

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
	});
	shell.useIntegratedComponent.mockClear();
});
