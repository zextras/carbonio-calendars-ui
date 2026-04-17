/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-ui-commons';

import { editEventItem, moveEventItem } from './appointment-actions-items';
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
