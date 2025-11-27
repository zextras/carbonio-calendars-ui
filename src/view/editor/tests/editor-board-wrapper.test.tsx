/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { Board } from '@zextras/carbonio-shell-ui';

import { defaultEditor } from './common';
import * as shell from '../../../../__mocks__/@zextras/carbonio-shell-ui';
import { generateEditor } from '../../../commons/editor-generator';
import { CALENDAR_BOARD_ID, PREFS_DEFAULTS } from '../../../constants';
import { reducers } from '../../../store/redux';
import { Editor } from '../../../types/editor';
import BoardEditPanel from '../editor-board-wrapper';
import { setupTest } from '@test-setup';
import defaultSettings from '@test-utils/settings/default-settings';

const initBoard = ({
	editorId,
	isNew
}: {
	editorId: string;
	isNew: boolean;
}): Board & { editor: Editor } => ({
	boardViewId: CALENDAR_BOARD_ID,
	title: 'Nuovo appuntamento',
	id: editorId,
	app: 'carbonio-calendars-ui',
	icon: 'CalendarModOutline',
	editor: { ...defaultEditor, id: editorId, isNew }
});

shell.getUserSettings.mockImplementation(() => ({
	...defaultSettings,
	prefs: {
		...defaultSettings.prefs,
		zimbraPrefUseTimeZoneListInCalendar: 'TRUE',
		zimbraPrefCalendarDefaultApptDuration: '60m',
		zimbraPrefCalendarApptReminderWarningTime: '5',
		zimbraPrefDefaultCalendarId: PREFS_DEFAULTS.DEFAULT_CALENDAR_ID
	}
}));

shell.useBoardHooks.mockImplementation(() => ({
	updateBoard: vi.fn()
}));

describe('Editor board wrapper', () => {
	describe('rendering', () => {
		it('it does not render without board id', async () => {
			const store = configureStore({
				reducer: combineReducers(reducers)
			});

			setupTest(<BoardEditPanel />, { store });
			expect(screen.queryByTestId('EditorPanel')).not.toBeInTheDocument();
		});

		it('it renders with board id', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });

			shell.getBridgedFunctions.mockImplementation(() => ({
				createSnackbar: vi.fn()
			}));

			shell.useBoard.mockImplementation(() => initBoard({ editorId: '1', isNew: true }));
			generateEditor({
				context: {
					folders: {},
					dispatch: store.dispatch,
					...defaultEditor
				}
			});
			setupTest(<BoardEditPanel />, { store });

			expect(await screen.findByTestId('EditorPanel')).toBeInTheDocument();
		});
	});
});
