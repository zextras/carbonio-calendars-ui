/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { Board } from '@zextras/carbonio-shell-ui';

import BoardEditPanel from './editor-board-wrapper';
import * as shell from '../../../__mocks__/@zextras/carbonio-shell-ui';
import defaultSettings from '../../carbonio-ui-commons/test/mocks/settings/default-settings';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { generateEditor } from '../../commons/editor-generator';
import { CALENDAR_BOARD_ID, PREFS_DEFAULTS } from '../../constants';
import { EVENT_DISPLAY_STATUS } from '../../constants/api';
import { reducers } from '../../store/redux';
import { Editor } from '../../types/editor';

const defaultEditor: Editor = {
	id: '1',
	title: 'Nuovo appuntamento',
	panel: false,
	isException: false,
	isSeries: false,
	isInstance: true,
	isRichText: true,
	isNew: true,
	attachmentFiles: [],
	sender: { email: 'test@test.com', fullName: 'Test' },
	organizer: { email: 'test@test.com', fullName: 'Test' },
	location: '',
	attendees: [],
	optionalAttendees: [],
	allDay: false,
	freeBusy: EVENT_DISPLAY_STATUS.BUSY,
	class: 'PUB',
	originalStart: 1667834497505,
	originalEnd: 1667834497505,
	start: 1667834497505,
	end: 1667834497505,
	timezone: 'Europe/Berlin',
	reminder: '5',
	richText: '',
	plainText: '',
	disabled: {
		richTextButton: false,
		attachmentsButton: false,
		saveButton: false,
		sendButton: false,
		organizer: false,
		title: false,
		location: false,
		virtualRoom: false,
		attendees: false,
		optionalAttendees: false,
		freeBusySelector: false,
		calendarSelector: false,
		private: false,
		datePicker: false,
		timezone: false,
		allDay: false,
		reminder: false,
		recurrence: false,
		attachments: false,
		composer: false
	}
};

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
	updateBoard: jest.fn()
}));

describe('Editor board wrapper', () => {
	it('it does not render without board id', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});

		setupTest(<BoardEditPanel />, { store });
		expect(screen.queryByTestId('EditorPanel')).not.toBeInTheDocument();
	});

	it('it renders with board id', async () => {
		const isNew = true;
		const store = configureStore({ reducer: combineReducers(reducers) });

		shell.getBridgedFunctions.mockImplementation(() => ({
			createSnackbar: jest.fn()
		}));

		shell.useBoard.mockImplementation(() => initBoard({ editorId: '1', isNew }));
		generateEditor({
			context: {
				folders: {},
				dispatch: store.dispatch,
				...defaultEditor
			}
		});
		setupTest(<BoardEditPanel />, { store });
		expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
	});
});
