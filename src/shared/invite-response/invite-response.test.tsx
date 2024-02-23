/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen } from '@testing-library/react';
import moment from 'moment-timezone';

import clearAllMocks = jest.clearAllMocks;
import { InviteResponse } from './invite-response';
import {
	buildMailMessageType,
	MESSAGE_METHOD,
	MESSAGE_TYPE,
	setupServerSingleEventResponse
} from './invite-test-utils';
import { useFolderStore } from '../../carbonio-ui-commons/store/zustand/folder';
import * as shell from '../../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { generateRoots } from '../../carbonio-ui-commons/test/mocks/folders/roots-generator';
import { setupTest } from '../../carbonio-ui-commons/test/test-setup';
import * as handler from '../../commons/get-appointment';
import * as getMsgHandler from '../../soap/get-message-request';
import * as modifyAppointmentHandler from '../../store/actions/new-modify-appointment';
import { reducers } from '../../store/redux';
import mockedData from '../../test/generators';
import {
	exceptionAppointmentAllDayResponse,
	exceptionAppointmentResponse,
	seriesAppointmentAllDayResponse,
	seriesAppointmentResponse,
	singleAppointmentAllDayResponse,
	singleAppointmentResponse
} from '../../test/mocks/network/msw/handle-get-appointment';
import {
	seriesGetMsgAllDayResponse,
	seriesGetMsgResponse,
	singleGetMsgAllDayResponse,
	singleGetMsgResponse
} from '../../test/mocks/network/msw/handle-get-invite';
import 'jest-styled-components';

const roots = generateRoots();
const folder = mockedData.calendars.defaultCalendar;

const setupFoldersStore = (): void => {
	useFolderStore.setState(() => ({
		roots: {
			...roots,
			USER: {
				...roots.USER,
				children: [folder]
			}
		},
		folders: {
			[folder.id]: folder
		}
	}));
};

afterEach(() => {
	clearAllMocks();
});

describe('invite response', () => {
	describe('invite-response component, case invitation email', () => {
		test('have a container with border of 0.0625rem solid regular', () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});
			const container = screen.getByTestId('invite-response');
			expect(container).toHaveStyleRule('border', '0.0625rem solid #cfd5dc');
		});
		test('have a container with border radius of 0.875rem', () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});
			const container = screen.getByTestId('invite-response');
			expect(container).toHaveStyleRule('border-radius', '0.875rem');
		});
		test('have a container with margin extrasmall', () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});
			const container = screen.getByTestId('invite-response');
			expect(container).toHaveStyleRule('margin', '0.25rem');
		});
		test('have a container with padding extralarge', () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});
			const container = screen.getByTestId('invite-response');
			expect(container).toHaveStyleRule('padding', '1.5rem');
		});
		describe('inside the container there is ', () => {
			test('a string composed by organizer + invited you to an event + event name. Event name is bold', () => {
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
				const store = configureStore({ reducer: combineReducers(reducers) });
				setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
					store
				});
				const organizer = mailMsg.invite[0].comp[0].or.d;
				const title = mailMsg.invite[0].comp[0].name;
				const organizerString = screen.getByText(`${organizer} invited you to an event`);
				const titleString = screen.getByText(title);
				expect(organizerString).toBeVisible();
				expect(titleString).toBeVisible();
				expect(titleString).toHaveStyleRule('font-size', '1.125rem');
			});
			test('a string with the user local time of the event', () => {
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
				const store = configureStore({ reducer: combineReducers(reducers) });
				setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
					store
				});

				const localTimeString = screen.getByText(/tuesday, 30 january, 2024 09:00 - 09:30/i);

				expect(localTimeString).toBeVisible();
			});
			test('a string with the user local time of the event', () => {
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
				const store = configureStore({ reducer: combineReducers(reducers) });
				setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
					store
				});

				const localTimezoneString = screen.getByText(/gmt \+01:00 europe\/berlin/i);

				expect(localTimezoneString).toBeVisible();
			});
			test.skip('if the event is created with a different timezone there is an icon with a tooltip showing the local timezone', async () => {
				const currentTimezone = 'Asia/Kolkata';
				moment.tz.guess = jest.fn().mockImplementation(() => currentTimezone);
				moment.tz.setDefault(currentTimezone);
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
				const store = configureStore({ reducer: combineReducers(reducers) });
				const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
					store
				});

				const timezoneIcon = screen.getByTestId('icon: GlobeOutline');

				expect(timezoneIcon).toBeVisible();

				user.hover(timezoneIcon);

				const tooltipTitleString = await screen.findByText(/Date and time on creation/i);

				const tooltipLocalTime = await screen.findByText(
					/tuesday, 30 january, 2024 09:00 - 09:30/i
				);

				const tooltipLocalTimeZone = await screen.findByText(/GMT \+01:00 Europe\/Berlin/i);

				expect(tooltipTitleString).toBeVisible();
				expect(tooltipLocalTime).toBeVisible();
				expect(tooltipLocalTimeZone).toBeVisible();
			});
		});
	});

	describe('on propose new time action', () => {
		test('an editor is created', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const proposeButton = screen.getByRole('button', { name: /Propose new time/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			expect(store.getState().editor.editors['new-1']).toBeDefined();
		});
		test('a board is opened', async () => {
			setupFoldersStore();

			const boardSpy = jest.spyOn(shell, 'addBoard');

			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const proposeButton = screen.getByRole('button', { name: /Propose new time/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			expect(boardSpy).toHaveBeenCalled();
			expect(boardSpy).toHaveBeenCalledTimes(1);
			expect(boardSpy).toHaveBeenCalledWith(expect.objectContaining({ url: 'calendars/' }));
		});
		test('if the event is non recurrent a non recurrent editor is created', async () => {
			setupFoldersStore();

			const store = configureStore({ reducer: combineReducers(reducers) });
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);

			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const proposeButton = screen.getByRole('button', { name: /Propose new time/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			const editor = Object.values(store.getState().editor.editors)[0];
			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(true);
			expect(editor.allDay).toBe(false);
			expect(editor.isSeries).toBe(false);
			expect(editor.recur).toBeUndefined();
			expect(editor.exceptId).toBeUndefined();
		});
		test('if the event is non recurrent and all day a non recurrent all day editor is created', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, true);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const proposeButton = screen.getByRole('button', { name: /Propose new time/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			const editor = Object.values(store.getState().editor.editors)[0];

			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(true);
			expect(editor.allDay).toBe(true);
			expect(editor.isSeries).toBe(false);
			expect(editor.recur).toBeUndefined();
			expect(editor.exceptId).toBeUndefined();
		});
		test('if the event is recurrent a series editor is created', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SERIES, false);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const proposeButton = screen.getByRole('button', { name: /Propose new time/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			const editor = Object.values(store.getState().editor.editors)[0];

			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(false);
			expect(editor.allDay).toBe(false);
			expect(editor.isSeries).toBe(true);
			expect(editor.recur).toBeDefined();
			expect(editor.exceptId).toBeUndefined();
		});
		test('if the event is recurrent and all day a series all day editor is created', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SERIES, true);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const proposeButton = screen.getByRole('button', { name: /Propose new time/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			const editor = Object.values(store.getState().editor.editors)[0];

			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(false);
			expect(editor.allDay).toBe(true);
			expect(editor.isSeries).toBe(true);
			expect(editor.recur).toBeDefined();
			expect(editor.exceptId).toBeUndefined();
		});
		test('if the event is an exception an exception editor is created', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.EXCEPT, false);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const proposeButton = screen.getByRole('button', { name: /Propose new time/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			const editor = Object.values(store.getState().editor.editors)[0];

			expect(editor.isException).toBe(true);
			expect(editor.isInstance).toBe(true);
			expect(editor.allDay).toBe(false);
			expect(editor.isSeries).toBe(false);
			expect(editor.recur).toBeUndefined();
			expect(editor.exceptId).toBeDefined();
		});
		test('if the event is an all day exception an all day exception editor is created', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.EXCEPT, true);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const proposeButton = screen.getByRole('button', { name: /Propose new time/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			const editor = Object.values(store.getState().editor.editors)[0];

			expect(editor.isException).toBe(true);
			expect(editor.isInstance).toBe(true);
			expect(editor.allDay).toBe(true);
			expect(editor.isSeries).toBe(false);
			expect(editor.recur).toBeUndefined();
			expect(editor.exceptId).toBeDefined();
		});
	});
	describe('on accept proposed time', () => {
		test('a getAppointment request is sent', async () => {
			setupFoldersStore();
			const spy = jest.spyOn(handler, 'getAppointment');
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const acceptProposedTimeButton = screen.getByRole('button', { name: /Accept/i });
			await act(async () => {
				await user.click(acceptProposedTimeButton);
			});

			expect(spy).toHaveBeenCalledTimes(1);

			spy.mockClear();
		});
		test('a getInvite request is sent', async () => {
			setupServerSingleEventResponse(singleAppointmentResponse, singleGetMsgResponse);
			setupFoldersStore();
			const getMsgSpy = jest.spyOn(getMsgHandler, 'getMessageRequest');
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const acceptProposedTimeButton = screen.getByRole('button', { name: /Accept/i });
			await act(async () => {
				await user.click(acceptProposedTimeButton);
			});

			expect(getMsgSpy).toHaveBeenCalledTimes(1);

			getMsgSpy.mockClear();
		});
		test('a ModifyAppointment request is sent', async () => {
			setupServerSingleEventResponse(singleAppointmentResponse, singleGetMsgResponse);

			setupFoldersStore();
			const modifyAppointmentSpy = jest.spyOn(modifyAppointmentHandler, 'modifyAppointment');
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const acceptProposedTimeButton = screen.getByRole('button', { name: /Accept/i });
			await act(async () => {
				await user.click(acceptProposedTimeButton);
			});

			expect(modifyAppointmentSpy).toHaveBeenCalledTimes(1);

			modifyAppointmentSpy.mockClear();
		});
		test('if the event is non recurrent a non recurrent editor is created', async () => {
			setupFoldersStore();
			setupServerSingleEventResponse(singleAppointmentResponse, singleGetMsgResponse);
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});
			const proposeButton = screen.getByRole('button', { name: /Accept/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			const editor = Object.values(store.getState().editor.editors)[0];
			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(true);
			expect(editor.allDay).toBe(false);
			expect(editor.isSeries).toBe(false);
			expect(editor.recur).toBeUndefined();
			expect(editor.exceptId).toBeUndefined();
		});
		test('if the event is non recurrent and all day a non recurrent all day editor is created', async () => {
			setupFoldersStore();
			setupServerSingleEventResponse(singleAppointmentAllDayResponse, singleGetMsgAllDayResponse);
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, true);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});
			const proposeButton = screen.getByRole('button', { name: /Accept/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			const editor = Object.values(store.getState().editor.editors)[0];
			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(true);
			expect(editor.allDay).toBe(true);
			expect(editor.isSeries).toBe(false);
			expect(editor.recur).toBeUndefined();
			expect(editor.exceptId).toBeUndefined();
		});
		test('if the event is recurrent a series editor is created', async () => {
			setupFoldersStore();
			setupServerSingleEventResponse(seriesAppointmentResponse, seriesGetMsgResponse);
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SERIES, false);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const proposeButton = screen.getByRole('button', { name: /Accept/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			const editor = Object.values(store.getState().editor.editors)[0];

			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(false);
			expect(editor.allDay).toBe(false);
			expect(editor.isSeries).toBe(true);
			expect(editor.recur).toBeDefined();
			expect(editor.exceptId).toBeUndefined();
		});
		test('if the event is recurrent and all day a series all day editor is created', async () => {
			setupFoldersStore();
			setupServerSingleEventResponse(seriesAppointmentAllDayResponse, seriesGetMsgAllDayResponse);
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SERIES, true);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const proposeButton = screen.getByRole('button', { name: /Accept/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			const editor = Object.values(store.getState().editor.editors)[0];

			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(false);
			expect(editor.allDay).toBe(true);
			expect(editor.isSeries).toBe(true);
			expect(editor.recur).toBeDefined();
			expect(editor.exceptId).toBeUndefined();
		});
		test('if the event is an exception an exception editor is created', async () => {
			setupFoldersStore();
			setupServerSingleEventResponse(exceptionAppointmentResponse, seriesGetMsgResponse);

			const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.EXCEPT, false);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const proposeButton = screen.getByRole('button', { name: /Accept/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			const editor = Object.values(store.getState().editor.editors)[0];

			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(true);
			expect(editor.allDay).toBe(false);
			expect(editor.isSeries).toBe(false);
			expect(editor.recur).toBeUndefined();
			expect(editor.exceptId).toBeDefined();
		});
		test('if the event is an all day exception an all day exception editor is created', async () => {
			setupFoldersStore();
			setupServerSingleEventResponse(
				exceptionAppointmentAllDayResponse,
				seriesGetMsgAllDayResponse
			);

			const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.EXCEPT, true);

			const store = configureStore({ reducer: combineReducers(reducers) });
			const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={jest.fn()} />, {
				store
			});

			const proposeButton = screen.getByRole('button', { name: /Accept/i });
			await act(async () => {
				await user.click(proposeButton);
			});
			const editor = Object.values(store.getState().editor.editors)[0];

			expect(editor.isException).toBe(false);
			expect(editor.isInstance).toBe(true);
			expect(editor.allDay).toBe(true);
			expect(editor.isSeries).toBe(false);
			expect(editor.recur).toBeUndefined();
			expect(editor.exceptId).toBeDefined();
		});
	});
});
