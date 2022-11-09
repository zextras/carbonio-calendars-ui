import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { Board } from '@zextras/carbonio-shell-ui';
import React from 'react';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { createCallbacks } from '../../commons/editor-generator';
import { CALENDAR_APP_ID } from '../../constants';
import { reducers } from '../../store/redux';
import { Editor, EditorCallbacks } from '../../types/editor';
import BoardEditPanel from './editor-board-wrapper';
import {
	getRandomEditorId,
	mockEmptyStore,
	generateCalendarSliceItem,
	generateEditorSliceItem
} from '../../test/generators/generators';
import * as shell from '../../../__mocks__/@zextras/carbonio-shell-ui';

const initBoard = ({
	editorId,
	isNew
}: {
	editorId: string;
	isNew: boolean;
}): Board & { callbacks: EditorCallbacks } & Editor => ({
	url: 'calendars/',
	title: 'Nuovo appuntamento',
	calendar: {
		checked: true,
		broken: false,
		freeBusy: false,
		deletable: false,
		absFolderPath: '/Calendar',
		color: {
			color: '#FF7043',
			background: '#FFF0EC',
			label: 'orange'
		},
		id: '10',
		name: 'Calendar',
		n: 305,
		acl: {
			grant: [
				{
					zid: '663d50fd-3e0f-4b7f-a488-f799953540eb',
					gt: 'usr',
					perm: 'r'
				}
			]
		},
		isShared: false,
		haveWriteAccess: true
	},
	panel: false,
	isException: false,
	isSeries: false,
	isInstance: true,
	isRichText: true,
	isNew,
	attachmentFiles: [],
	organizer: {
		value: '0',
		label: 'DEFAULT Gabriele Marino (<gabriele.marino@zextras.com>) ',
		address: 'gabriele.marino@zextras.com',
		fullName: 'Gabriele Marino',
		identityName: 'DEFAULT'
	},
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
	callbacks: createCallbacks(editorId),
	app: 'carbonio-calendars-ui',
	icon: 'CalendarModOutline'
});

describe('Editor board wrapper', () => {
	test('it does not render without board id', () => {
		const store = configureStore({
			devTools: {
				name: CALENDAR_APP_ID
			},
			reducer: combineReducers(reducers)
		});

		setupTest(<BoardEditPanel />, { store });
		expect(screen.queryByTestId('EditorPanel')).not.toBeInTheDocument();
	});
	test('it renders with board id', async () => {
		const isNew = true;
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
		shell.getUserSettings.mockImplementation(() => ({
			prefs: {
				zimbraPrefUseTimeZoneListInCalendar: 'TRUE'
			}
		}));
		shell.useBoard.mockImplementation(() => initBoard({ editorId, isNew }));
		setupTest(<BoardEditPanel />, { store });
		expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
		expect(screen.getByTestId('send')).toBeDisabled();
		expect(screen.getByTestId('save')).toBeEnabled();
	});
});
