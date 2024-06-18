/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { editEventItem } from './appointment-actions-items';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui-constants';
import mockedData from '../test/generators';

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
			createAndApplyTag: jest.fn(),
			createModal: jest.fn(),
			createSnackbar: jest.fn(),
			dispatch: jest.fn(),
			tags: {
				0: {
					id: '1',
					name: 'one'
				}
			},
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
				createAndApplyTag: jest.fn(),
				createModal: jest.fn(),
				createSnackbar: jest.fn(),
				dispatch: jest.fn(),
				tags: {
					0: {
						id: '1',
						name: 'one'
					}
				},
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
				createAndApplyTag: jest.fn(),
				createModal: jest.fn(),
				createSnackbar: jest.fn(),
				dispatch: jest.fn(),
				tags: {
					0: {
						id: '1',
						name: 'one'
					}
				},
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
				createAndApplyTag: jest.fn(),
				createModal: jest.fn(),
				createSnackbar: jest.fn(),
				dispatch: jest.fn(),
				tags: {
					0: {
						id: '1',
						name: 'one'
					}
				},
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
				createAndApplyTag: jest.fn(),
				createModal: jest.fn(),
				createSnackbar: jest.fn(),
				dispatch: jest.fn(),
				tags: {
					0: {
						id: '1',
						name: 'one'
					}
				},
				folders
			};
			const editAction = editEventItem({ invite, event, context });
			expect(editAction.disabled).toBe(true);
		});
	});
});
