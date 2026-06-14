/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { waitFor } from '@testing-library/react';
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { answerToEventItem, editEventItem, moveEventItem } from './appointment-actions-items';
import * as soapLib from '../../__mocks__/@zextras/carbonio-ui-soap-lib';
import { EVENT_ACTIONS } from 'constants/event-actions';
import { InviteReplyVerb } from 'soap/send-invite-reply-request';
import { reducers } from 'store/redux';
import mockedData from '../test/generators';

describe('appointment-actions-items', () => {
	describe('edit event item', () => {
		test('if an event has no organizer it is still editable', () => {
			const folder = {
				id: FOLDERS.CALENDAR,
				l: '1',
				name: 'Calendar',
				view: 'appointment',
				absFolderPath: '/'
			};

			const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

			const event = mockedData.getEvent({
				resource: {
					organizer: undefined,
					calendar: folder
				}
			});
			const invite = mockedData.getInvite({ event });
			const context = {
				createAndApplyTag: vi.fn(),
				createModal: vi.fn(),
				closeModal: vi.fn(),
				createSnackbar: vi.fn(),
				dispatch: vi.fn(),
				t: vi.fn(),
				replaceHistory: vi.fn(),
				tags: [
					{
						id: '1',
						name: 'one'
					}
				],
				folders
			};
			const editAction = editEventItem({ invite, event, context });
			expect(editAction.disabled).toBe(false);
		});

		describe('is disabled when', () => {
			test('the event is on trash', () => {
				const folder = {
					id: FOLDERS.TRASH,
					l: '1',
					name: 'Trash',
					view: 'appointment',
					absFolderPath: '/Trash/'
				};

				const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

				const event = mockedData.getEvent({
					resource: {
						calendar: folder
					}
				});
				const invite = mockedData.getInvite({ event });
				const context = {
					createAndApplyTag: vi.fn(),
					createModal: vi.fn(),
					closeModal: vi.fn(),
					createSnackbar: vi.fn(),
					dispatch: vi.fn(),
					t: vi.fn(),
					replaceHistory: vi.fn(),
					tags: [
						{
							id: '1',
							name: 'one'
						}
					],
					folders
				};
				const editAction = editEventItem({ invite, event, context });
				expect(editAction.disabled).toBe(true);
			});
			test('the event is on a trash sub folder', () => {
				const subFolder = {
					id: '1234',
					l: FOLDERS.TRASH,
					name: 'subFolder',
					view: 'appointment',
					absFolderPath: '/Trash/subFolder'
				};

				const folder = {
					id: FOLDERS.TRASH,
					l: '1',
					name: 'Trash',
					view: 'appointment',
					absFolderPath: '/Trash/',
					children: [subFolder]
				};

				const folders = mockedData.calendars.getCalendarsMap({ folders: [folder, subFolder] });

				const event = mockedData.getEvent({
					resource: {
						calendar: subFolder
					}
				});
				const invite = mockedData.getInvite({ event });
				const context = {
					createAndApplyTag: vi.fn(),
					createModal: vi.fn(),
					closeModal: vi.fn(),
					createSnackbar: vi.fn(),
					dispatch: vi.fn(),
					t: vi.fn(),
					replaceHistory: vi.fn(),
					tags: [
						{
							id: '1',
							name: 'one'
						}
					],
					folders
				};
				const editAction = editEventItem({ invite, event, context });
				expect(editAction.disabled).toBe(true);
			});
			test('if user is owner of the calendar but he is not the organizer', () => {
				const folder = {
					id: FOLDERS.CALENDAR,
					l: '1',
					name: 'Calendar',
					view: 'appointment',
					absFolderPath: '/Calendar/'
				};

				const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

				const event = mockedData.getEvent({
					resource: {
						calendar: folder,
						iAmOrganizer: false
					}
				});
				const invite = mockedData.getInvite({ event });
				const context = {
					createAndApplyTag: vi.fn(),
					createModal: vi.fn(),
					closeModal: vi.fn(),
					createSnackbar: vi.fn(),
					dispatch: vi.fn(),
					t: vi.fn(),
					replaceHistory: vi.fn(),
					tags: [
						{
							id: '1',
							name: 'one'
						}
					],
					folders
				};
				const editAction = editEventItem({ invite, event, context });
				expect(editAction.disabled).toBe(true);
			});
			test("if it is inside a shared calendar or user doesn't have write access", () => {
				const folder = {
					id: FOLDERS.CALENDAR,
					l: '1',
					name: 'Calendar',
					view: 'appointment',
					absFolderPath: '/Calendar/',
					owner: 'owner@mail.com'
				};

				const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

				const event = mockedData.getEvent({
					resource: {
						calendar: folder,
						iAmOrganizer: false,
						organizer: {
							name: 'myself',
							email: 'myself@mail.com'
						}
					}
				});
				const invite = mockedData.getInvite({ event });
				const context = {
					createAndApplyTag: vi.fn(),
					createModal: vi.fn(),
					closeModal: vi.fn(),
					createSnackbar: vi.fn(),
					dispatch: vi.fn(),
					t: vi.fn(),
					replaceHistory: vi.fn(),
					tags: [
						{
							id: '1',
							name: 'one'
						}
					],
					folders
				};
				const editAction = editEventItem({ invite, event, context });
				expect(editAction.disabled).toBe(true);
			});
		});
	});

	describe('answerToEventItem', () => {
		it('forwards invite to accept item so SendInviteReply includes m', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const spy = vi
				.spyOn(soapLib, 'legacySoapFetch')
				.mockResolvedValueOnce({ apptId: '1', calItemId: '1', invId: '1' } as any);

			const event = mockedData.getEvent({
				resource: {
					iAmOrganizer: false,
					organizer: { name: 'Organizer', email: 'organizer@example.com' }
				}
			});
			const invite = mockedData.getInvite({ event });
			const context = {
				createAndApplyTag: vi.fn(),
				createModal: vi.fn(),
				closeModal: vi.fn(),
				createSnackbar: vi.fn(),
				dispatch: store.dispatch,
				t: vi.fn().mockImplementation((_key: string, fallback: string) => fallback),
				replaceHistory: vi.fn(),
				tags: [],
				folders: mockedData.calendars.getCalendarsMap({ length: 0 })
			};

			const answerItem = answerToEventItem({ event, invite, context });
			expect(answerItem).toBeDefined();
			const acceptItem = answerItem?.items.find((item) => item.id === EVENT_ACTIONS.ACCEPT);
			expect(acceptItem).toBeDefined();

			acceptItem?.onClick?.();

			await waitFor(() => {
				expect(spy).toHaveBeenCalledWith(
					'SendInviteReply',
					expect.objectContaining({
						m: expect.objectContaining({ su: expect.stringContaining('Accepted') })
					})
				);
			});
		});

		it('fetches invite on-demand and includes m in SendInviteReply when invite is undefined', async () => {
			const store = configureStore({ reducer: combineReducers(reducers) });
			const rawInviteMsg = {
				id: 'fetched-msg-1',
				inv: [
					{
						comp: [
							{
								name: 'Fetched Meeting',
								s: [{ u: 1704067200000, d: '20240101T100000', tz: 'UTC' }],
								e: [{ u: 1704070800000, d: '20240101T110000', tz: 'UTC' }],
								or: { a: 'organizer@example.com' },
								at: []
							}
						]
					}
				],
				parts: []
			};
			const spy = vi
				.spyOn(soapLib, 'legacySoapFetch')
				.mockResolvedValueOnce({ m: [rawInviteMsg] } as any)
				.mockResolvedValueOnce({ apptId: '1', calItemId: '1', invId: '1' } as any);

			const event = mockedData.getEvent({
				resource: {
					iAmOrganizer: false,
					organizer: { name: 'Organizer', email: 'organizer@example.com' }
				}
			});
			const context = {
				createAndApplyTag: vi.fn(),
				createModal: vi.fn(),
				closeModal: vi.fn(),
				createSnackbar: vi.fn(),
				dispatch: store.dispatch,
				t: vi.fn().mockImplementation((_key: string, fallback: string) => fallback),
				replaceHistory: vi.fn(),
				tags: [],
				folders: mockedData.calendars.getCalendarsMap({ length: 0 })
			};

			const answerItem = answerToEventItem({ event, invite: undefined, context });
			const acceptItem = answerItem?.items.find((item) => item.id === EVENT_ACTIONS.ACCEPT);

			acceptItem?.onClick?.();

			await waitFor(() => {
				expect(spy).toHaveBeenCalledWith(
					'SendInviteReply',
					expect.objectContaining({
						m: expect.objectContaining({ su: expect.stringContaining('Accepted') })
					})
				);
			});
		});
	});

	describe('move event item', () => {
		describe('returns undefined when', () => {
			test('the event is in an external sync folder with url property', () => {
				const folder = {
					id: '12345',
					l: '1',
					name: 'External Calendar',
					view: 'appointment',
					absFolderPath: '/External Calendar/',
					url: 'https://external.calendar.com'
				};

				const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

				const event = mockedData.getEvent({
					resource: {
						calendar: folder
					}
				});

				const context = {
					createAndApplyTag: vi.fn(),
					createModal: vi.fn(),
					closeModal: vi.fn(),
					createSnackbar: vi.fn(),
					dispatch: vi.fn(),
					t: vi.fn(),
					replaceHistory: vi.fn(),
					tags: [
						{
							id: '1',
							name: 'one'
						}
					],
					folders
				};

				const moveAction = moveEventItem({ event, context });
				expect(moveAction).toBeUndefined();
			});

			test('the event is in an external sync folder with y flag', () => {
				const folder = {
					id: '12345',
					l: '1',
					name: 'External Calendar',
					view: 'appointment',
					absFolderPath: '/External Calendar/',
					f: 'y'
				};

				const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

				const event = mockedData.getEvent({
					resource: {
						calendar: folder
					}
				});

				const context = {
					createAndApplyTag: vi.fn(),
					createModal: vi.fn(),
					closeModal: vi.fn(),
					createSnackbar: vi.fn(),
					dispatch: vi.fn(),
					t: vi.fn(),
					replaceHistory: vi.fn(),
					tags: [
						{
							id: '1',
							name: 'one'
						}
					],
					folders
				};

				const moveAction = moveEventItem({ event, context });
				expect(moveAction).toBeUndefined();
			});

			test('the folder has read-only permissions', () => {
				const folder = {
					id: '12345',
					l: '1',
					name: 'Read Only Calendar',
					view: 'appointment',
					absFolderPath: '/Read Only Calendar/',
					perm: 'r'
				};

				const folders = mockedData.calendars.getCalendarsMap({ folders: [folder] });

				const event = mockedData.getEvent({
					resource: {
						calendar: folder,
						iAmOrganizer: true
					}
				});

				const context = {
					createAndApplyTag: vi.fn(),
					createModal: vi.fn(),
					closeModal: vi.fn(),
					createSnackbar: vi.fn(),
					dispatch: vi.fn(),
					t: vi.fn(),
					replaceHistory: vi.fn(),
					tags: [
						{
							id: '1',
							name: 'one'
						}
					],
					folders
				};

				const moveAction = moveEventItem({ event, context });
				expect(moveAction).toBeUndefined();
			});

			test('event calendar has read-only permissions and folder map does not contain it', () => {
				const folder = {
					id: 'missing-in-map',
					l: '1',
					name: 'Read Only Calendar',
					view: 'appointment',
					absFolderPath: '/Read Only Calendar/',
					perm: 'r'
				};

				const event = mockedData.getEvent({
					resource: {
						calendar: folder,
						iAmOrganizer: true
					}
				});

				const context = {
					createAndApplyTag: vi.fn(),
					createModal: vi.fn(),
					closeModal: vi.fn(),
					createSnackbar: vi.fn(),
					dispatch: vi.fn(),
					t: vi.fn(),
					replaceHistory: vi.fn(),
					tags: [
						{
							id: '1',
							name: 'one'
						}
					],
					folders: mockedData.calendars.getCalendarsMap({ length: 0 })
				};

				const moveAction = moveEventItem({ event, context });
				expect(moveAction).toBeUndefined();
			});
		});
	});
});
