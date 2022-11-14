/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';
import { screen } from '@testing-library/react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import EditorPanelWrapper from './editor-panel-wrapper';
import {
	generateCalendarSliceItem,
	generateEditorSliceItem,
	getRandomEditorId,
	mockEmptyStore
} from '../../test/generators/generators';
import * as shell from '../../../__mocks__/@zextras/carbonio-shell-ui';
import { CALENDAR_APP_ID } from '../../constants';
import { reducers } from '../../store/redux';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';

// todo: datePicker render is very slow
jest.setTimeout(20000);

describe('Editor panel wrapper', () => {
	test('it doesnt render without editorId or callbacks', () => {
		const emptyStore = mockEmptyStore();

		const store = configureStore({
			devTools: {
				name: CALENDAR_APP_ID
			},
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
		test('without background container when it is not expanded', () => {
			const isNew = false;
			const editorId = getRandomEditorId(isNew);
			const calendars = {
				calendars: generateCalendarSliceItem()
			};
			const editor = {
				activeId: editorId,
				editors: generateEditorSliceItem({ editorId })
			};

			const emptyStore = mockEmptyStore({ calendars, editor });

			shell.useUserSettings.mockImplementation(() => ({
				prefs: {
					zimbraPrefUseTimeZoneListInCalendar: 'FALSE'
				}
			}));

			const store = configureStore({
				devTools: {
					name: CALENDAR_APP_ID
				},
				reducer: combineReducers(reducers),
				preloadedState: emptyStore
			});

			setupTest(<EditorPanelWrapper />, { store });
			expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
			expect(screen.queryByTestId('EditorBackgroundContainer')).not.toBeInTheDocument();
			expect(screen.getByTestId('AppointmentCardContainer')).toBeInTheDocument();
			expect(screen.getByTestId('EditorHeader')).toBeInTheDocument();
		});
		test('with background container when it is expanded', async () => {
			const isNew = false;
			const editorId = getRandomEditorId(isNew);
			const calendars = {
				calendars: generateCalendarSliceItem()
			};
			const editor = {
				activeId: editorId,
				editors: generateEditorSliceItem({ editorId })
			};

			const emptyStore = mockEmptyStore({ calendars, editor });

			const store = configureStore({
				devTools: {
					name: CALENDAR_APP_ID
				},
				reducer: combineReducers(reducers),
				preloadedState: emptyStore
			});

			const { user } = setupTest(<EditorPanelWrapper />, { store });

			await user.click(screen.getByTestId('expand'));

			await screen.findByTestId('icon: Collapse');

			expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
			expect(screen.getByTestId('EditorBackgroundContainer')).toBeInTheDocument();
			expect(screen.getByTestId('AppointmentCardContainer')).toBeInTheDocument();
			expect(screen.getByTestId('EditorHeader')).toBeInTheDocument();

			await user.click(screen.getByTestId('expand'));

			await screen.findByTestId('icon: Expand');

			expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
			expect(screen.queryByTestId('EditorBackgroundContainer')).not.toBeInTheDocument();
			expect(screen.getByTestId('AppointmentCardContainer')).toBeInTheDocument();
			expect(screen.getByTestId('EditorHeader')).toBeInTheDocument();
		});
	});
});
