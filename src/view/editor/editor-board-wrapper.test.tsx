/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { Board } from '@zextras/carbonio-shell-ui';
import React from 'react';
import { Dispatch } from 'redux';
import defaultSettings from '../../carbonio-ui-commons/test/mocks/settings/default-settings';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { createCallbacks } from '../../commons/editor-generator';
import { PREFS_DEFAULTS } from '../../constants';
import { reducers } from '../../store/redux';
import mockedData from '../../test/generators';
import { Editor, EditorCallbacks } from '../../types/editor';
import BoardEditPanel from './editor-board-wrapper';
import * as shell from '../../../__mocks__/@zextras/carbonio-shell-ui';

const initBoard = ({
	editorId,
	isNew,
	dispatch
}: {
	editorId: string;
	isNew: boolean;
	dispatch: Dispatch;
}): Board & { callbacks: EditorCallbacks } & Editor => ({
	url: 'calendars/',
	title: 'Nuovo appuntamento',
	panel: false,
	isException: false,
	isSeries: false,
	isInstance: true,
	isRichText: true,
	isNew,
	attachmentFiles: [],
	location: '',
	attendees: [],
	optionalAttendees: [],
	allDay: false,
	freeBusy: 'B',
	class: 'PUB',
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
	},
	id: editorId,
	callbacks: createCallbacks(editorId, { dispatch }),
	app: 'carbonio-calendars-ui',
	icon: 'CalendarModOutline'
});

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

describe('Editor board wrapper', () => {
	test('it does not render without board id', () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});

		setupTest(<BoardEditPanel />, { store });
		expect(screen.queryByTestId('EditorPanel')).not.toBeInTheDocument();
	});
	test('it renders with board id', async () => {
		const isNew = true;
		const editorId = mockedData.utils.getRandomEditorId(isNew);
		const store = configureStore({ reducer: combineReducers(reducers) });

		shell.getBridgedFunctions.mockImplementation(() => ({
			createSnackbar: jest.fn()
		}));

		shell.useBoard.mockImplementation(() =>
			initBoard({ editorId, isNew, dispatch: store.dispatch })
		);
		setupTest(<BoardEditPanel />, { store });

		expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
	});
});
