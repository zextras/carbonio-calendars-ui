/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen } from '@testing-library/react';
import { Board } from '@zextras/carbonio-shell-ui';

import BoardEditPanel from './editor-board-wrapper';
import * as shell from '../../../__mocks__/@zextras/carbonio-shell-ui';
import defaultSettings from '../../carbonio-ui-commons/test/mocks/settings/default-settings';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { PREFS_DEFAULTS } from '../../constants';
import { reducers } from '../../store/redux';
import mockedData from '../../test/generators';
import { Editor } from '../../types/editor';

const initBoard = ({
	editorId,
	isNew
}: {
	editorId: string;
	isNew: boolean;
}): Board & { editor: Editor } => ({
	url: 'calendars/',
	title: 'Nuovo appuntamento',
	id: editorId,
	app: 'carbonio-calendars-ui',
	icon: 'CalendarModOutline',
	editor: {
		id: editorId,
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
	}
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

shell.useBoardHooks.mockImplementation(() => ({
	updateBoard: jest.fn()
}));

describe('Editor board wrapper', () => {
	test('it does not render without board id', async () => {
		const store = configureStore({
			reducer: combineReducers(reducers)
		});

		await act(async () => {
			await setupTest(<BoardEditPanel />, { store });
		});
		expect(screen.queryByTestId('EditorPanel')).not.toBeInTheDocument();
	});
	test('it renders with board id', async () => {
		const isNew = true;
		const editorId = mockedData.utils.getRandomEditorId(isNew);
		const store = configureStore({ reducer: combineReducers(reducers) });

		shell.getBridgedFunctions.mockImplementation(() => ({
			createSnackbar: jest.fn()
		}));

		shell.useBoard.mockImplementation(() => initBoard({ editorId, isNew }));
		await act(async () => {
			await setupTest(<BoardEditPanel />, { store });
		});

		expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
	});
});
