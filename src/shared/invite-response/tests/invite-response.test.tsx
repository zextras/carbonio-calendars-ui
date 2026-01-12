/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { act, screen, waitFor, within } from '@testing-library/react';
import { useFolderStore } from '@zextras/carbonio-ui-commons';
import { keyBy, values } from 'lodash';
import moment from 'moment-timezone';

import * as handler from '../../../commons/get-appointment';
import { CALENDAR_BOARD_ID } from '../../../constants';
import * as mockshell from '@test-mocks/@zextras/carbonio-shell-ui';
import { setupTest } from '@test-setup';
import { generateRoots } from '@test-utils/folders/roots-generator';
import { createSoapAPIInterceptor } from '@test-utils/network/msw/create-api-interceptor';
import { MESSAGE_METHOD } from 'constants/api';
import { InviteResponse } from 'shared/invite-response/invite-response';
import {
	buildMailMessageType,
	MESSAGE_TYPE,
	setupServerSingleEventResponse
} from 'shared/invite-response/invite-test-utils';
import * as getFreeBusyResponseHandler from 'soap/get-free-busy-request';
import * as getMsgHandler from 'soap/get-message-request';
import * as moveAppointmentHandler from 'store/actions/move-appointment';
import * as modifyAppointmentHandler from 'store/actions/new-modify-appointment';
import * as sendInviteResponseHandler from 'store/actions/send-invite-response';
import { reducers } from 'store/redux';
import mockedData from 'test/generators';
import {
	exceptionAppointmentAllDayResponse,
	exceptionAppointmentResponse,
	seriesAppointmentAllDayResponse,
	seriesAppointmentResponse,
	singleAppointmentAllDayResponse,
	singleAppointmentResponse
} from 'test/mocks/network/msw/handle-get-appointment';
import {
	seriesGetMsgAllDayResponse,
	seriesGetMsgResponse,
	singleGetMsgAllDayResponse,
	singleGetMsgResponse
} from 'test/mocks/network/msw/handle-get-invite';

const roots = generateRoots();
const folder = mockedData.calendars.defaultCalendar;
const folder2 = mockedData.calendars.getCalendar();

const setupFoldersStore = (): void => {
	useFolderStore.setState(() => ({
		folders: {
			...keyBy(roots, 'id'),
			[folder.id]: folder,
			[folder2.id]: folder2
		}
	}));
};

describe('invite response component', () => {
	describe('case invitation email', () => {
		test('have a container with border of 0.0625rem solid regular', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
				store
			});
			const container = await screen.findByTestId('invite-response');
			expect(container).toHaveStyleRule('border', '0.0625rem solid #cfd5dc');
		});
		test('have a container with border radius of 0.875rem', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
				store
			});
			const container = await screen.findByTestId('invite-response');
			expect(container).toHaveStyleRule('border-radius', '0.875rem');
		});
		test('have a container with margin extrasmall', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
				store
			});
			const container = await screen.findByTestId('invite-response');
			expect(container).toHaveStyleRule('margin', '0.25rem');
		});
		test('have a container with padding extralarge', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
				store
			});
			const container = await screen.findByTestId('invite-response');
			expect(container).toHaveStyleRule('padding', '1.5rem');
		});

		describe('inside the container there is ', () => {
			test('a string composed by organizer + invited you to an event + event name. Event name is bold', async () => {
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);

				const store = configureStore({ reducer: combineReducers(reducers) });
				setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
					store
				});
				const organizer = mailMsg.invite[0].comp[0].or.d;
				const title = mailMsg.invite[0].comp[0].name;
				const organizerString = await screen.findByText(`${organizer} invited you to an event`);
				const boldTitleString = await screen.findByText(title);
				expect(organizerString).toBeVisible();
				expect(boldTitleString).toBeVisible();
				expect(boldTitleString).toHaveStyle('font-weight: bolder');
			});
			test('a string with the user local time of the event', async () => {
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
				createSoapAPIInterceptor('GetAppointment', {});
				const store = configureStore({ reducer: combineReducers(reducers) });
				setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
					store
				});

				const localTimeString = await screen.findByText(
					'Tuesday, January 30, 2024, 9:00 – 9:30 AM GMT+01:00 Europe/Berlin'
				);

				expect(localTimeString).toBeVisible();
			});
			test('if the event lasts multiple days non all day there will be the complete format for both start and end time', async () => {
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false, {
					invite: [
						{
							comp: [
								{
									s: [
										{
											d: '20240128T090000',
											tz: 'Europe/Berlin',
											u: moment('20240128T090000').valueOf()
										}
									],
									e: [
										{
											d: '20240130T093000',
											tz: 'Europe/Berlin',
											u: moment('20240130T093000').valueOf()
										}
									]
								}
							]
						}
					]
				});

				createSoapAPIInterceptor('GetAppointment', {});
				const store = configureStore({ reducer: combineReducers(reducers) });

				setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
					store
				});

				const localTimeString = await screen.findByText(/Sunday, January 28, 2024/i);

				expect(localTimeString).toBeVisible();
			});
			test('if the event is created with a different timezone there is an icon with a tooltip showing the local timezone', async () => {
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false, {
					invite: [
						{
							tz: [{ id: 'Asia/Kolkata' }]
						}
					]
				});

				createSoapAPIInterceptor('GetAppointment', {});
				const store = configureStore({ reducer: combineReducers(reducers) });
				const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
					store
				});

				const timezoneIcon = await screen.findByTestId('icon: GlobeOutline');

				expect(timezoneIcon).toBeVisible();

				user.hover(timezoneIcon);

				const tooltipTitleString = await screen.findByText(/Date and time on creation/i);

				const tooltipLocalTime = await screen.findByText(
					'Tuesday, January 30, 2024, 1:30 – 2:00 PM GMT+05:30 Asia/Kolkata'
				);

				expect(tooltipTitleString).toBeVisible();
				expect(tooltipLocalTime).toBeVisible();
			});
			describe('a row which inform the user about his availability', () => {
				test('if the appointment is received by the primary account, it will be the one used', async () => {
					const name = 'sam@mail.com';
					mockshell.useUserAccount.mockImplementation(() => ({
						name,
						displayName: name,
						id: '0e9d1df6-30df-4e1d-aff6-212908045221',
						identities: { identity: [] },
						rights: { targets: [] },
						signatures: { signature: [] }
					}));
					const getFreeBusyHandler = vi.spyOn(getFreeBusyResponseHandler, 'getFreeBusyRequest');
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
					const store = configureStore({ reducer: combineReducers(reducers) });

					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					await waitFor(() => {
						expect(getFreeBusyHandler).toHaveBeenCalledWith(
							expect.objectContaining({
								uid: name
							})
						);
					});
				});
				test('if the appointment is received by the secondary account, it will be the one used', async () => {
					const getFreeBusyHandler = vi.spyOn(getFreeBusyResponseHandler, 'getFreeBusyRequest');
					setupFoldersStore();
					const rootsArray = values(roots);
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false, {
						parent: rootsArray[1].uuid
					});
					const store = configureStore({ reducer: combineReducers(reducers) });

					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					await waitFor(
						() => {
							expect(getFreeBusyHandler).toHaveBeenCalledWith(
								expect.objectContaining({
									uid: rootsArray[1].name
								})
							);
						},
						{ timeout: 10000 }
					);
				});
			});
			test('a checkbox to notify the organizer checked by default', async () => {
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
				createSoapAPIInterceptor('GetAppointment', {});
				const store = configureStore({ reducer: combineReducers(reducers) });
				setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
					store
				});

				const checkbox = await screen.findByTestId(/icon: CheckmarkSquare/i);
				const string = await screen.findByText(/Notify organizer/i);

				expect(checkbox).toBeVisible();
				expect(string).toBeVisible();
			});
			test('a select field to select the calendar destination for the appointment', async () => {
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
				createSoapAPIInterceptor('GetAppointment', {});
				const store = configureStore({ reducer: combineReducers(reducers) });
				setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
					store
				});

				const calendar = await screen.findByText('Calendar');

				expect(calendar).toBeVisible();
			});
			describe('three different buttons to reply to the invitation: ', () => {
				describe('a button to accept the invitation', () => {
					test('has the label "accept"', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const accept = await screen.findByRole('button', {
							name: /accept/i
						});

						expect(accept).toBeVisible();
					});
					test('has text color green', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const accept = await screen.findByRole('button', {
							name: /accept/i
						});

						expect(accept).toHaveStyleRule('color', '#8bc34a');
					});
					test('has a checkmark icon', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const accept = await screen.findByRole('button', {
							name: /accept/i
						});

						expect(within(accept).getByTestId(/icon: CheckmarkOutline/i)).toBeVisible();
					});
					test("if the user didn't accept the invitation, it is enabled", async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const accept = await screen.findByRole('button', {
							name: /accept/i
						});

						expect(accept).toBeEnabled();
					});
					test.todo('if the user accepted the invitation, it is disabled');
				});
				describe('a button to accept the invitation as tentative', () => {
					test('has the label tentative', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const tentative = await screen.findByRole('button', {
							name: /tentative/i
						});

						expect(tentative).toBeVisible();
					});
					test('has text color yellow', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const tentative = await screen.findByRole('button', {
							name: /tentative/i
						});

						expect(tentative).toHaveStyleRule('color', '#ffc107');
					});
					test('has a question mark icon', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const tentative = await screen.findByRole('button', {
							name: /tentative/i
						});

						expect(within(tentative).getByTestId(/icon: QuestionMarkOutline/i)).toBeVisible();
					});
					test("if the user didn't accept as tentative the invitation, it is enabled", async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const tentative = await screen.findByRole('button', {
							name: /tentative/i
						});

						expect(tentative).toBeEnabled();
					});
					test.todo('if the user accepted as tentative the invitation, it is disabled');
				});
				describe('a button to decline the invitation', () => {
					test('has the label decline', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const decline = await screen.findByRole('button', {
							name: /decline/i
						});

						expect(decline).toBeVisible();
					});
					test('has text color red', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const decline = await screen.findByRole('button', {
							name: /decline/i
						});

						expect(decline).toHaveStyleRule('color', '#d74942');
					});
					test('has a close icon', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const decline = await screen.findByRole('button', {
							name: /decline/i
						});

						expect(within(decline).getByTestId(/icon: CloseOutline/i)).toBeVisible();
					});
					test("if the user didn't decline the invitation, it is enabled", async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const decline = await screen.findByRole('button', {
							name: /decline/i
						});

						expect(decline).toBeEnabled();
					});
					test.todo('if the user declined the invitation, it is disabled');
				});
				describe('clicking on any of these buttons will send the reply to the organizer', () => {
					test('a sendInviteResponse will be sent', async () => {
						const sendInviteSpy = vi.spyOn(sendInviteResponseHandler, 'sendInviteResponse');
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const accept = await screen.findByRole('button', {
							name: /accept/i
						});

						await user.click(accept);
						expect(sendInviteSpy).toHaveBeenCalled();
					});
					test('if the "notify organizer" checkbox is checked, it will set updateOrganizer as true', async () => {
						const sendInviteSpy = vi.spyOn(sendInviteResponseHandler, 'sendInviteResponse');
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const accept = await screen.findByRole('button', {
							name: /accept/i
						});

						await user.click(accept);
						expect(sendInviteSpy).toHaveBeenCalledTimes(1);
						expect(sendInviteSpy).toHaveBeenCalledWith(
							expect.objectContaining({
								updateOrganizer: true
							})
						);
					});
					test('if a different calendar destination is set, will send a move appointment request', async () => {
						setupFoldersStore();
						const moveAppointmentSpy = vi.spyOn(moveAppointmentHandler, 'moveAppointmentRequest');

						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const calendar = await screen.findByText(folder.name);
						await user.click(calendar);

						const calendar2 = await screen.findByText(folder2.name);
						await user.click(calendar2);

						const accept = await screen.findByRole('button', {
							name: /accept/i
						});

						await act(async () => {
							await user.click(accept);
						});

						expect(moveAppointmentSpy).toHaveBeenCalledTimes(1);
						expect(moveAppointmentSpy).toHaveBeenCalledWith(
							expect.objectContaining({
								l: folder2.id
							})
						);
					});
					test('selecting the default calendar destination will not send a move appointment request', async () => {
						setupFoldersStore();
						const moveAppointmentSpy = vi.spyOn(moveAppointmentHandler, 'moveAppointmentRequest');

						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const accept = await screen.findByRole('button', {
							name: /accept/i
						});

						await user.click(accept);

						expect(moveAppointmentSpy).not.toHaveBeenCalled();
					});
				});
			});
			describe('a button to propose a different time for the appointment', () => {
				test('has the label "propose new time"', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
					createSoapAPIInterceptor('GetAppointment', {});
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const propose = await screen.findByRole('button', {
						name: /propose new time/i
					});

					expect(propose).toBeVisible();
				});
				test('it is always enabled', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
					createSoapAPIInterceptor('GetAppointment', {});
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const propose = await screen.findByRole('button', {
						name: /propose new time/i
					});

					expect(propose).toBeEnabled();
				});
				describe('clicking on propose new time', () => {
					test('an editor is created', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const proposeButton = await screen.findByRole('button', { name: /Propose new time/i });
						await user.click(proposeButton);
						expect(store.getState().editor.editors['new-1']).toBeDefined();
					});
					test('a board is opened', async () => {
						setupFoldersStore();

						const boardSpy = vi.spyOn(mockshell, 'addBoard');

						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const proposeButton = await screen.findByRole('button', { name: /Propose new time/i });
						await user.click(proposeButton);
						expect(boardSpy).toHaveBeenCalled();
						expect(boardSpy).toHaveBeenCalledTimes(1);
						expect(boardSpy).toHaveBeenCalledWith(
							expect.objectContaining({ boardViewId: CALENDAR_BOARD_ID })
						);
					});
					test('if the event is non recurrent a non recurrent editor is created', async () => {
						setupFoldersStore();

						const store = configureStore({ reducer: combineReducers(reducers) });
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const proposeButton = await screen.findByRole('button', { name: /Propose new time/i });
						await user.click(proposeButton);
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
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const proposeButton = await screen.findByRole('button', { name: /Propose new time/i });
						await user.click(proposeButton);
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
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.SERIES,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const proposeButton = await screen.findByRole('button', { name: /Propose new time/i });
						await user.click(proposeButton);
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
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const proposeButton = await screen.findByRole('button', { name: /Propose new time/i });
						await user.click(proposeButton);
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
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.REQUEST,
							MESSAGE_TYPE.EXCEPT,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const proposeButton = await screen.findByRole('button', { name: /Propose new time/i });
						await user.click(proposeButton);
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
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const proposeButton = await screen.findByRole('button', { name: /Propose new time/i });
						await user.click(proposeButton);
						const editor = Object.values(store.getState().editor.editors)[0];

						expect(editor.isException).toBe(true);
						expect(editor.isInstance).toBe(true);
						expect(editor.allDay).toBe(true);
						expect(editor.isSeries).toBe(false);
						expect(editor.recur).toBeUndefined();
						expect(editor.exceptId).toBeDefined();
					});
				});
			});
			test.todo('if there is an equipment it will be visible');
			test.todo('if there is a meeting room it will be visible');
			test.todo('if there is a virtual meeting room it will be visible');
			describe('a required participant section composed by:', () => {
				test('an icon', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
					createSoapAPIInterceptor('GetAppointment', {});
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const icon = await screen.findByTestId('icon: PeopleOutline');

					expect(icon).toBeVisible();
				});
				test('a string with the number of required participants', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
					createSoapAPIInterceptor('GetAppointment', {});
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const participantString = await screen.findByText(/1 participant/i);

					expect(participantString).toBeVisible();
				});
				test.todo('the chip of the organizer');
				test.todo('the chip of the participant');
				test.todo('maximum of 5 participants are visible');
				test.todo('if participants are more than 5 a "more..." text is visible');
				test.todo('clicking on more will show all the participants');
			});
			describe('an optional participant section composed by:', () => {
				test('an icon', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
					createSoapAPIInterceptor('GetAppointment', {});
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const icon = await screen.findByTestId('icon: OptionalInviteeOutline');

					expect(icon).toBeVisible();
				});
				test('a string with the number of optional participants', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
					createSoapAPIInterceptor('GetAppointment', {});
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const participantString = await screen.findByText(/1 optional/i);

					expect(participantString).toBeVisible();
				});
				test.todo('the chip of the optional participant');
				test.todo('maximum of 5 optional participants are visible');
				test.todo('if participants are more than 5 a more text is visible');
				test.todo('clicking on more will show all the participants');
			});
			describe('a section for the description of the appointment composed by:', () => {
				test.todo('if there is no description this section is not visible');
				test.todo('a divider');
				test('an icon', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
					createSoapAPIInterceptor('GetAppointment', {});
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const messageIcon = await screen.findByTestId('icon: MessageSquareOutline');

					expect(messageIcon).toBeVisible();
				});
				test('a string with the entire message', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.REQUEST, MESSAGE_TYPE.SINGLE, false);
					createSoapAPIInterceptor('GetAppointment', {});
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const messageString = await screen.findByText(mailMsg.invite[0].comp[0].desc[0]._content);

					expect(messageString).toBeVisible();
				});
			});
		});
	});
	describe('case counter invitation email', () => {
		test('have a container with border of 0.0625rem solid regular', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
				store
			});
			const container = await screen.findByTestId('invite-response');
			expect(container).toHaveStyleRule('border', '0.0625rem solid #cfd5dc');
		});
		test('have a container with border radius of 0.875rem', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
				store
			});
			const container = await screen.findByTestId('invite-response');
			expect(container).toHaveStyleRule('border-radius', '0.875rem');
		});
		test('have a container with margin extrasmall', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
				store
			});
			const container = await screen.findByTestId('invite-response');
			expect(container).toHaveStyleRule('margin', '0.25rem');
		});
		test('have a container with padding extralarge', async () => {
			setupFoldersStore();
			const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);
			const store = configureStore({ reducer: combineReducers(reducers) });
			setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
				store
			});
			const container = await screen.findByTestId('invite-response');
			expect(container).toHaveStyleRule('padding', '1.5rem');
		});
		describe('inside the container there is ', () => {
			test('the mail message subject', async () => {
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);
				createSoapAPIInterceptor('GetAppointment', {});
				const store = configureStore({ reducer: combineReducers(reducers) });
				setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
					store
				});
				const titleString = await screen.findByText(mailMsg.subject);
				expect(titleString).toBeVisible();
				expect(titleString).toHaveStyleRule('font-size', '1.125rem');
			});
			test('should show the correct start and end time', async () => {
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);
				createSoapAPIInterceptor('GetAppointment', {});
				const store = configureStore({ reducer: combineReducers(reducers) });
				setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
					store
				});
				const titleString = await screen.findByText(mailMsg.subject);
				expect(titleString).toBeVisible();
				expect(titleString).toHaveStyleRule('font-size', '1.125rem');

				expect(
					screen.getByText('Tuesday, January 30, 2024, 9:00 – 9:30 AM GMT+01:00 Europe/Berlin')
				).toBeVisible();
			});
			test('a string with the user local time of the event', async () => {
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);
				createSoapAPIInterceptor('GetAppointment', {});
				const store = configureStore({ reducer: combineReducers(reducers) });
				setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
					store
				});

				const localTimeString = await screen.findByText(
					'Tuesday, January 30, 2024, 9:00 – 9:30 AM GMT+01:00 Europe/Berlin'
				);

				expect(localTimeString).toBeVisible();
			});
			test('if the event is created with a different timezone there is an icon with a tooltip showing the local timezone', async () => {
				setupFoldersStore();
				const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false, {
					invite: [
						{
							tz: [{ id: 'Asia/Kolkata' }]
						}
					]
				});
				createSoapAPIInterceptor('GetAppointment', {});
				const store = configureStore({ reducer: combineReducers(reducers) });
				const { user } = setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
					store
				});

				const timezoneIcon = await screen.findByTestId('icon: GlobeOutline');

				expect(timezoneIcon).toBeVisible();

				user.hover(timezoneIcon);

				const tooltipTitleString = await screen.findByText(/Date and time on creation/i);

				const tooltipLocalTime = await screen.findByText(
					'Tuesday, January 30, 2024, 1:30 – 2:00 PM GMT+05:30 Asia/Kolkata'
				);

				expect(tooltipTitleString).toBeVisible();
				expect(tooltipLocalTime).toBeVisible();
			});
			describe('two different buttons to reply to the counter appointment: ', () => {
				describe('a button to accept the counter appointment', () => {
					test('has the label "accept"', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.COUNTER,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const accept = await screen.findByRole('button', {
							name: /accept/i
						});

						expect(accept).toBeVisible();
					});
					test.todo('has text color green');
					// icon: CheckmarkOutline
					test.todo('has a checkmark icon');
					test('it is always enabled', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.COUNTER,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const accept = await screen.findByRole('button', {
							name: /accept/i
						});

						expect(accept).toBeEnabled();
					});
					describe('clicking on accept will confirm the new time of the appointment', () => {
						test('a getAppointment request is sent', async () => {
							setupFoldersStore();
							const spy = vi.spyOn(handler, 'getAppointment');
							const mailMsg = buildMailMessageType(
								MESSAGE_METHOD.COUNTER,
								MESSAGE_TYPE.SINGLE,
								false
							);

							const store = configureStore({ reducer: combineReducers(reducers) });
							const { user } = setupTest(
								<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />,
								{
									store
								}
							);

							const acceptProposedTimeButton = await screen.findByRole('button', {
								name: /Accept/i
							});
							await user.click(acceptProposedTimeButton);

							expect(spy).toHaveBeenCalled();

							spy.mockClear();
						});
						test('a getInvite request is sent', async () => {
							setupServerSingleEventResponse(singleAppointmentResponse, singleGetMsgResponse);
							setupFoldersStore();
							const getMsgSpy = vi.spyOn(getMsgHandler, 'getMessageRequest');
							const mailMsg = buildMailMessageType(
								MESSAGE_METHOD.COUNTER,
								MESSAGE_TYPE.SINGLE,
								false
							);
							const store = configureStore({ reducer: combineReducers(reducers) });
							const { user } = setupTest(
								<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />,
								{
									store
								}
							);

							const acceptProposedTimeButton = await screen.findByRole('button', {
								name: /Accept/i
							});
							await act(async () => {
								await user.click(acceptProposedTimeButton);
							});

							expect(getMsgSpy).toHaveBeenCalledTimes(1);

							getMsgSpy.mockClear();
						});
						test('a ModifyAppointment request is sent', async () => {
							setupServerSingleEventResponse(singleAppointmentResponse, singleGetMsgResponse);

							setupFoldersStore();
							const modifyAppointmentSpy = vi.spyOn(modifyAppointmentHandler, 'modifyAppointment');
							const mailMsg = buildMailMessageType(
								MESSAGE_METHOD.COUNTER,
								MESSAGE_TYPE.SINGLE,
								false
							);
							const store = configureStore({ reducer: combineReducers(reducers) });
							const { user } = setupTest(
								<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />,
								{
									store
								}
							);

							const acceptProposedTimeButton = await screen.findByRole('button', {
								name: /Accept/i
							});
							await act(async () => {
								await user.click(acceptProposedTimeButton);
							});

							expect(modifyAppointmentSpy).toHaveBeenCalledTimes(1);

							modifyAppointmentSpy.mockClear();
						});
						test('if the event is non recurrent a non recurrent editor is created', async () => {
							setupFoldersStore();
							setupServerSingleEventResponse(singleAppointmentResponse, singleGetMsgResponse);
							const mailMsg = buildMailMessageType(
								MESSAGE_METHOD.COUNTER,
								MESSAGE_TYPE.SINGLE,
								false
							);
							const store = configureStore({ reducer: combineReducers(reducers) });
							const { user } = setupTest(
								<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />,
								{
									store
								}
							);
							const proposeButton = await screen.findByRole('button', { name: /Accept/i });
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
							setupServerSingleEventResponse(
								singleAppointmentAllDayResponse,
								singleGetMsgAllDayResponse
							);
							const mailMsg = buildMailMessageType(
								MESSAGE_METHOD.COUNTER,
								MESSAGE_TYPE.SINGLE,
								true
							);
							const store = configureStore({ reducer: combineReducers(reducers) });
							const { user } = setupTest(
								<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />,
								{
									store
								}
							);
							const proposeButton = await screen.findByRole('button', { name: /Accept/i });
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
							const mailMsg = buildMailMessageType(
								MESSAGE_METHOD.COUNTER,
								MESSAGE_TYPE.SERIES,
								false
							);
							const store = configureStore({ reducer: combineReducers(reducers) });
							const { user } = setupTest(
								<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />,
								{
									store
								}
							);

							const proposeButton = await screen.findByRole('button', { name: /Accept/i });
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
							setupServerSingleEventResponse(
								seriesAppointmentAllDayResponse,
								seriesGetMsgAllDayResponse
							);
							const mailMsg = buildMailMessageType(
								MESSAGE_METHOD.COUNTER,
								MESSAGE_TYPE.SERIES,
								true
							);
							const store = configureStore({ reducer: combineReducers(reducers) });
							const { user } = setupTest(
								<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />,
								{
									store
								}
							);

							const proposeButton = await screen.findByRole('button', { name: /Accept/i });
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

							const mailMsg = buildMailMessageType(
								MESSAGE_METHOD.COUNTER,
								MESSAGE_TYPE.EXCEPT,
								false
							);
							const store = configureStore({ reducer: combineReducers(reducers) });
							const { user } = setupTest(
								<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />,
								{
									store
								}
							);

							const proposeButton = await screen.findByRole('button', { name: /Accept/i });
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

							const mailMsg = buildMailMessageType(
								MESSAGE_METHOD.COUNTER,
								MESSAGE_TYPE.EXCEPT,
								true
							);
							const store = configureStore({ reducer: combineReducers(reducers) });
							const { user } = setupTest(
								<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />,
								{
									store
								}
							);

							const proposeButton = await screen.findByRole('button', { name: /Accept/i });
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
				describe('a button to decline the counter appointment', () => {
					test('has the label decline', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.COUNTER,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const decline = await screen.findByRole('button', {
							name: /decline/i
						});

						expect(decline).toBeVisible();
					});
					test.todo('has text color red');
					// icon: CloseOutline
					test.todo('has a close icon');
					test('it is always enabled', async () => {
						setupFoldersStore();
						const mailMsg = buildMailMessageType(
							MESSAGE_METHOD.COUNTER,
							MESSAGE_TYPE.SINGLE,
							false
						);
						createSoapAPIInterceptor('GetAppointment', {});
						const store = configureStore({ reducer: combineReducers(reducers) });
						setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
							store
						});

						const decline = await screen.findByRole('button', {
							name: /decline/i
						});

						expect(decline).toBeEnabled();
					});
					describe('clicking on decline will call the mail integration to send a mail, It will prefill the composer ', () => {
						test.todo(
							'"text" field with the values "text" for normal text and the fragment for the html text'
						);
						test('"subject" field with "Proposal declined: " + event title', async () => {
							const openComposerSpy = vi.fn();
							vi.spyOn(mockshell, 'useIntegratedFunction').mockReturnValue([openComposerSpy, true]);
							setupFoldersStore();
							const mailMsg = buildMailMessageType(
								MESSAGE_METHOD.COUNTER,
								MESSAGE_TYPE.SINGLE,
								false
							);
							createSoapAPIInterceptor('GetAppointment', {});
							const store = configureStore({ reducer: combineReducers(reducers) });
							const { user } = setupTest(
								<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />,
								{
									store
								}
							);

							const decline = await screen.findByRole('button', {
								name: /decline/i
							});
							await user.click(decline);

							expect(openComposerSpy).toHaveBeenCalled();
							const composerArgs = openComposerSpy.mock.calls[0][1];
							expect(composerArgs.subject).toBe('Proposal declined: single event subject');
						});
						test('"to" field contains participants with type changed from "f" to "t"', async () => {
							const openComposerSpy = vi.fn();
							vi.spyOn(mockshell, 'useIntegratedFunction').mockReturnValue([openComposerSpy, true]);
							setupFoldersStore();
							const mailMsg = buildMailMessageType(
								MESSAGE_METHOD.COUNTER,
								MESSAGE_TYPE.SINGLE,
								false
							);
							createSoapAPIInterceptor('GetAppointment', {});
							const store = configureStore({ reducer: combineReducers(reducers) });
							const { user } = setupTest(
								<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />,
								{
									store
								}
							);

							const decline = await screen.findByRole('button', {
								name: /decline/i
							});
							await user.click(decline);

							expect(openComposerSpy).toHaveBeenCalled();
							const composerArgs = openComposerSpy.mock.calls[0][1];
							expect(composerArgs.to).toBeDefined();
							expect(composerArgs.to).toEqual(
								expect.arrayContaining([
									expect.objectContaining({
										type: 't',
										address: 'sender@mail.com'
									})
								])
							);
						});
					});
				});
			});
			test.todo('CHARACTERIZATION TEST: if there is an equipment it will be visible');
			test.todo('CHARACTERIZATION TEST: if there is a meeting room it will be visible');
			test.todo('CHARACTERIZATION TEST: if there is a virtual meeting room it will be visible');
			test.todo('a divider');
			describe('a required participant section composed by:', () => {
				test('an icon', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);
					createSoapAPIInterceptor('GetAppointment', {});
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const icon = await screen.findByTestId('icon: PeopleOutline');

					expect(icon).toBeVisible();
				});
				// mocked data is not aligned with the data received by mails. Use proper mock to test this behaviour
				test.skip('CHARACTERIZATION TEST: a string with "0 participants"', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const participantString = await screen.findByText(/0 participant/i);

					expect(participantString).toBeVisible();
				});
				test.todo('the chip of the organizer');
				test.todo('the chip of the participant');
				test.todo('maximum of 5 participants are visible');
				test.todo('if participants are more than 5 a more text is visible');
				test.todo('clicking on more will show all the participants');
			});
			describe('an optional participant section composed by:', () => {
				test('an icon', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);
					createSoapAPIInterceptor('GetAppointment', {});
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const icon = await screen.findByTestId('icon: OptionalInviteeOutline');

					expect(icon).toBeVisible();
				});
				test('a string with the number of optional participants', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);
					createSoapAPIInterceptor('GetAppointment', {});
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const participantString = await screen.findByText(/1 optional/i);

					expect(participantString).toBeVisible();
				});
				test.todo('the chip of the optional participant');
				test.todo('maximum of 5 optional participants are visible');
				test.todo('if participants are more than 5 a more text is visible');
				test.todo('clicking on more will show all the participants');
			});
			describe('a section for the description of the appointment composed by:', () => {
				test.todo('if there is no description this section is not visible');
				test.todo('a divider');
				test('an icon', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);
					createSoapAPIInterceptor('GetAppointment', {});
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const messageIcon = await screen.findByTestId('icon: MessageSquareOutline');

					expect(messageIcon).toBeVisible();
				});
				test('a string with the entire message', async () => {
					setupFoldersStore();
					const mailMsg = buildMailMessageType(MESSAGE_METHOD.COUNTER, MESSAGE_TYPE.SINGLE, false);
					createSoapAPIInterceptor('GetAppointment', {});
					const store = configureStore({ reducer: combineReducers(reducers) });
					setupTest(<InviteResponse mailMsg={mailMsg} moveToTrash={vi.fn()} />, {
						store
					});

					const messageString = await screen.findByText(mailMsg.invite[0].comp[0].desc[0]._content);

					expect(messageString).toBeVisible();
				});
			});
		});
	});
});
