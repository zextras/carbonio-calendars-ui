import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { screen } from '@testing-library/react';
import { Board } from '@zextras/carbonio-shell-ui';
import React from 'react';
import { Dispatch } from 'redux';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import { createCallbacks } from '../../commons/editor-generator';
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
import { getEditor } from './editor-panel-wrapper.test';

// todo: datePicker render is very slow
jest.setTimeout(50000);

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
	callbacks: createCallbacks(editorId, { dispatch }),
	app: 'carbonio-calendars-ui',
	icon: 'CalendarModOutline'
});

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
		const editorId = getRandomEditorId(isNew);
		const editor = getEditor(editorId);

		const calendars = {
			calendars: generateCalendarSliceItem()
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

		shell.getBridgedFunctions.mockImplementation(() => ({
			createSnackbar: jest.fn()
		}));
		shell.getUserSettings.mockImplementation(() => ({
			prefs: {
				zimbraPrefUseTimeZoneListInCalendar: 'TRUE'
			}
		}));
		shell.useBoard.mockImplementation(() =>
			initBoard({ editorId, isNew, dispatch: store.dispatch })
		);
		const { user } = setupTest(<BoardEditPanel />, { store });

		expect(screen.getByTestId('EditorPanel')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();

		expect(store.getState().editor.editors[editorId].isNew).toEqual(true);

		await user.click(screen.getByRole('button', { name: /save/i }));

		expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
		expect(store.getState().editor.editors[editorId].isNew).toEqual(false);
	});
});
