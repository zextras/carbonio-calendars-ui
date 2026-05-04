/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { t } from '@zextras/carbonio-shell-ui';
import { FOLDERS, useFolderStore, Folder, FolderView } from '@zextras/carbonio-ui-commons';

import {
	addExternalCalendarsItem,
	deleteCaldavCalendarItem,
	deleteCalendarItem,
	editCaldavCalendarItem,
	editCalendarItem,
	emptyTrashItem,
	moveToRootItem,
	newCalendarItem,
	noPermissionLabel,
	removeFromListItem,
	shareCalendarItem,
	syncCaldavCalendarItem,
	sharesInfoItem,
	syncExternalCalendarItem
} from './calendar-actions-items';
import mockedData from '../test/generators';
import { generateRoots } from '@test-utils/folders/roots-generator';
import { FOLDER_ACTIONS, SIDEBAR_ITEMS } from 'constants/sidebar';

const randomUUID = faker.string.uuid();
const TRASH_SUB_FOLDER_PATH = '/Trash/subFolder';
const genericTestItemTitleForIconItem =
	'is an item with properties id, icon, label, tooltipLabel, onClick, disabled';
const genericTestTitleForEachCases = 'return disabled set to true when %o';
const trashEmptyLabel = t('action.empty_trash', 'Empty Trash');
const trashTooltipLabel = 'action.Trash_already_empty';

const roots = generateRoots();
const childFolder = {
	absFolderPath: '/Calendar 1/Calendar child',
	id: `${randomUUID}:153`,
	l: `${randomUUID}:2048`,
	name: 'Calendar child',
	view: 'appointment' as FolderView,
	n: 1,
	uuid: 'abcddefg',
	recursive: false,
	deletable: false,
	activesyncdisabled: true,
	isLink: false,
	depth: 2,
	children: [],
	reminder: false,
	broken: false,
	acl: {
		grant: []
	}
};

const folder = {
	absFolderPath: '/Calendar 1',
	id: `${randomUUID}:2048`,
	l: `${randomUUID}:${SIDEBAR_ITEMS.ALL_CALENDAR}`,
	name: 'Calendar 1',
	owner: 'random owner',
	view: 'appointment' as FolderView,
	n: 1,
	uuid: 'abcd',
	recursive: false,
	deletable: false,
	activesyncdisabled: true,
	isLink: true,
	depth: 1,
	children: [childFolder],
	reminder: false,
	broken: false,
	acl: {
		grant: []
	}
};
const setupFoldersStore = (): void => {
	useFolderStore.setState(() => ({
		roots: {
			...roots,
			USER: {
				...roots.USER,
				children: [folder]
			}
		},
		folders: { [folder.id]: folder }
	}));
};

describe('calendar actions items', () => {
	describe('newCalendarItem', () => {
		test(genericTestItemTitleForIconItem, () => {
			const item = { id: FOLDERS.CALENDAR };
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const newItem = newCalendarItem({ createModal, closeModal, item });
			expect(newItem).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.NEW,
					icon: 'CalendarOutline',
					label: t('label.new_calendar', 'New calendar'),
					tooltipLabel: noPermissionLabel,
					onClick: expect.any(Function),
					disabled: false
				})
			);
		});
		test.each([
			{ id: FOLDERS.TRASH },
			{ id: SIDEBAR_ITEMS.ALL_CALENDAR },
			{ id: `153`, absFolderPath: TRASH_SUB_FOLDER_PATH },
			{ id: '154', perm: 'r' },
			{ id: `${randomUUID}:${FOLDERS.TRASH}` },
			{ id: `${randomUUID}:${SIDEBAR_ITEMS.ALL_CALENDAR}` },
			{ id: `${randomUUID}:153`, absFolderPath: TRASH_SUB_FOLDER_PATH },
			{ id: `${randomUUID}:154`, perm: 'r' }
		])(genericTestTitleForEachCases, (item) => {
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const newItem = newCalendarItem({ createModal, closeModal, item });
			expect(newItem).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
	});
	describe('addIcsFromUrlItem', () => {
		test(genericTestItemTitleForIconItem, () => {
			const item = mockedData.calendars.getCalendar();
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const addFromUrl = addExternalCalendarsItem({ createModal, closeModal, item });
			expect(addFromUrl).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.ADD_ICS_URL,
					icon: 'Link2',
					label: t('action.add_external_calendars', 'Add external calendars'),
					tooltipLabel: noPermissionLabel,
					onClick: expect.any(Function),
					disabled: false
				})
			);
		});

		test.each([
			{
				...mockedData.calendars.getCalendar(),
				id: `${FOLDERS.USER_ROOT}:${SIDEBAR_ITEMS.ALL_CALENDAR}`
			},
			{ ...mockedData.calendars.getCalendar(), id: FOLDERS.TRASH },
			{ ...mockedData.calendars.getCalendar(), id: '153', absFolderPath: TRASH_SUB_FOLDER_PATH },
			{ ...mockedData.calendars.getCalendar(), id: '153', isLink: true },
			childFolder,
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:${SIDEBAR_ITEMS.ALL_CALENDAR}` },
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:${FOLDERS.TRASH}` },
			{
				...mockedData.calendars.getCalendar(),
				id: `${randomUUID}:153`,
				absFolderPath: TRASH_SUB_FOLDER_PATH
			},
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:153`, isLink: true }
		])(genericTestTitleForEachCases, (item) => {
			setupFoldersStore();
			const createModal = vi.fn();
			const closeModal = vi.fn();
			const addFromUrl = addExternalCalendarsItem({
				createModal,
				closeModal,
				item: item as Folder
			});
			expect(addFromUrl).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
	});
	describe('moveToRootItem', () => {
		test(genericTestItemTitleForIconItem, () => {
			const item = { id: '10', absFolderPath: '/Calendar', depth: 1 };
			const createSnackbar = vi.fn();

			const moveItem = moveToRootItem({ createSnackbar, item });
			expect(moveItem).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.MOVE_TO_ROOT,
					icon: 'MoveOutline',
					label: 'action.move_to_root',
					tooltipLabel: noPermissionLabel,
					onClick: expect.any(Function),
					disabled: true
				})
			);
		});
		test.each([
			{ id: `${FOLDERS.USER_ROOT}:${SIDEBAR_ITEMS.ALL_CALENDAR}`, depth: 1 }, // testing id === all calendar
			{ id: FOLDERS.CALENDAR, depth: 1 }, // testing id === calendar
			{ id: FOLDERS.TRASH, depth: 1 }, // testing id === trash
			{ id: `${randomUUID}:${SIDEBAR_ITEMS.ALL_CALENDAR}`, depth: 1 }, // testing id === all calendar
			{ id: `${randomUUID}:${FOLDERS.CALENDAR}`, depth: 1 }, // testing id === calendar
			{ id: `${randomUUID}:${FOLDERS.TRASH}`, depth: 1 }, // testing id === trash
			{ id: FOLDERS.USER_ROOT, depth: 0 }, // testing depth < 2
			childFolder, // testing isLinkChild === true
			folder // testing owner is defined
		])(genericTestTitleForEachCases, (item) => {
			const createSnackbar = vi.fn();
			setupFoldersStore();

			const moveToRoot = moveToRootItem({ createSnackbar, item });
			expect(moveToRoot).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
		test('return label "label.restore_calendar" if nested in trash', () => {
			const createSnackbar = vi.fn();
			const item = { id: '152', depth: 2, absFolderPath: TRASH_SUB_FOLDER_PATH };
			const moveToRoot = moveToRootItem({ createSnackbar, item });
			expect(moveToRoot).toStrictEqual(
				expect.objectContaining({
					label: 'label.restore_calendar'
				})
			);
		});
		test('return label "action.move_to_root" if not nested in trash', () => {
			const createSnackbar = vi.fn();
			const item = { id: '152', depth: 2 };
			const moveToRoot = moveToRootItem({ createSnackbar, item });
			expect(moveToRoot).toStrictEqual(
				expect.objectContaining({
					label: 'action.move_to_root'
				})
			);
		});

		test('return disabled set to true when it is a CalDAV child calendar', () => {
			const createSnackbar = vi.fn();
			// CalDAV calendars are children of a datasource root folder
			const caldavChild = { id: 'caldav-cal', depth: 2, parent: 'caldav-ds-1', l: 'caldav-ds-1' };
			const caldavRoot = { id: 'caldav-ds-1', dsId: 'caldav-ds-1', dsType: 'caldav' as const };

			useFolderStore.setState(() => ({
				folders: {
					'caldav-ds-1': caldavRoot as Folder,
					'caldav-cal': caldavChild as Folder
				}
			}));

			const moveToRoot = moveToRootItem({ createSnackbar, item: caldavChild });
			expect(moveToRoot).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
	});
	describe('emptyTrashItem', () => {
		test(genericTestItemTitleForIconItem, () => {
			const item = { id: FOLDERS.TRASH, n: 2, children: [] };
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const empty = emptyTrashItem({ createModal, closeModal, item });
			expect(empty).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.EMPTY_TRASH,
					icon: 'DeletePermanentlyOutline',
					label: trashEmptyLabel,
					tooltipLabel: noPermissionLabel,
					onClick: expect.any(Function),
					disabled: false
				})
			);
		});
		test('return tooltipLabel "trash is already empty" when n is 0 and children is an empty array', () => {
			const trash = { id: FOLDERS.TRASH, n: 0, children: [] };
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const empty = emptyTrashItem({ createModal, closeModal, item: trash });
			expect(empty).toStrictEqual(
				expect.objectContaining({
					tooltipLabel: trashTooltipLabel
				})
			);
		});
		test('return disabled set to true when folder is not trash', () => {
			const trash = { id: FOLDERS.CALENDAR, n: 1, children: [] };
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const empty = emptyTrashItem({ createModal, closeModal, item: trash });
			expect(empty).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
		test('return disabled set to true when n === 0 and children.length === 0', () => {
			const trash = { id: FOLDERS.TRASH, n: 0, children: [] };
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const empty = emptyTrashItem({ createModal, closeModal, item: trash });
			expect(empty).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
		test('return disabled set to false when n > 0', () => {
			const trash = { id: FOLDERS.TRASH, n: 1, children: [] };
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const empty = emptyTrashItem({ createModal, closeModal, item: trash });
			expect(empty).toStrictEqual(
				expect.objectContaining({
					disabled: false
				})
			);
		});
		test('return disabled set to false when children.length > 0', () => {
			const trash = { id: FOLDERS.TRASH, n: 0, children: [{ id: '1235' } as Folder] };
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const empty = emptyTrashItem({ createModal, closeModal, item: trash });
			expect(empty).toStrictEqual(
				expect.objectContaining({
					disabled: false
				})
			);
		});
	});
	describe('editCalendarItem', () => {
		test(genericTestItemTitleForIconItem, () => {
			const item = { id: FOLDERS.CALENDAR, absFolderPath: '/Calendar' };
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const editItem = editCalendarItem({ createModal, closeModal, item });
			expect(editItem).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.EDIT,
					icon: 'Edit2Outline',
					label: t('action.edit_and_share_calendar', 'Edit and share calendar'),
					tooltipLabel: noPermissionLabel,
					onClick: expect.any(Function),
					disabled: false
				})
			);
		});
		test.each([
			{ id: FOLDERS.TRASH },
			{ id: `${FOLDERS.USER_ROOT}:${SIDEBAR_ITEMS.ALL_CALENDAR}` },
			{ id: `153`, absFolderPath: TRASH_SUB_FOLDER_PATH },
			{ id: `${randomUUID}:${FOLDERS.TRASH}` },
			{ id: `${randomUUID}:${SIDEBAR_ITEMS.ALL_CALENDAR}` },
			{ id: `${randomUUID}:153`, absFolderPath: TRASH_SUB_FOLDER_PATH }
		])(genericTestTitleForEachCases, (item) => {
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const editItem = editCalendarItem({ createModal, closeModal, item });
			expect(editItem).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
	});
	describe('deleteCalendarItem', () => {
		test(genericTestItemTitleForIconItem, () => {
			const item = {
				...mockedData.calendars.getCalendar(),
				id: '153',
				absFolderPath: '/randomFolder'
			};
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const deleteItem = deleteCalendarItem({ createModal, closeModal, item });
			expect(deleteItem).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.DELETE,
					icon: 'Trash2Outline',
					label: 'action.delete_calendar',
					tooltipLabel: noPermissionLabel,
					onClick: expect.any(Function),
					disabled: false
				})
			);
		});
		test.each([
			{ ...mockedData.calendars.getCalendar(), id: '153', absFolderPath: TRASH_SUB_FOLDER_PATH },
			{
				...mockedData.calendars.getCalendar(),
				id: `${randomUUID}:153`,
				absFolderPath: TRASH_SUB_FOLDER_PATH
			}
		])('return "label.delete_permanently" when the calendar is nested in trash', (item) => {
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const deleteItem = deleteCalendarItem({ createModal, closeModal, item });
			expect(deleteItem).toStrictEqual(
				expect.objectContaining({
					label: 'label.delete_permanently'
				})
			);
		});
		test.each([
			{ ...mockedData.calendars.getCalendar(), id: FOLDERS.TRASH },
			{ ...mockedData.calendars.getCalendar(), id: FOLDERS.CALENDAR },
			{ ...mockedData.calendars.getCalendar(), id: '153', perm: 'r', f: '#', url: undefined },
			{
				...mockedData.calendars.getCalendar(),
				id: `${FOLDERS.USER_ROOT}:${SIDEBAR_ITEMS.ALL_CALENDAR}`
			},
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:${FOLDERS.TRASH}` },
			{
				...mockedData.calendars.getCalendar(),
				id: `${randomUUID}:153`,
				perm: 'r',
				f: '#',
				url: undefined
			},
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:${SIDEBAR_ITEMS.ALL_CALENDAR}` },
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:${FOLDERS.CALENDAR}` }
		])(genericTestTitleForEachCases, (item) => {
			const createModal = vi.fn();
			const closeModal = vi.fn();

			const deleteItem = deleteCalendarItem({ createModal, closeModal, item });
			expect(deleteItem).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
	});
	describe('removeFromListItem', () => {
		test(genericTestItemTitleForIconItem, () => {
			const createSnackbar = vi.fn();
			setupFoldersStore();

			const removeFromList = removeFromListItem({ createSnackbar, item: folder });
			expect(removeFromList).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.REMOVE_FROM_LIST,
					icon: 'CloseOutline',
					label: 'remove_from_this_list',
					tooltipLabel: noPermissionLabel,
					onClick: expect.any(Function),
					disabled: false
				})
			);
		});
		test.each([
			childFolder,
			{ ...mockedData.calendars.getCalendar(), id: '153' },
			{ ...mockedData.calendars.getCalendar(), id: FOLDERS.CALENDAR },
			{ ...mockedData.calendars.getCalendar(), id: FOLDERS.TRASH },
			{ id: `153`, absFolderPath: TRASH_SUB_FOLDER_PATH },
			{
				...mockedData.calendars.getCalendar(),
				id: `${FOLDERS.USER_ROOT}:${SIDEBAR_ITEMS.ALL_CALENDAR}`
			},
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:153` },
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:${FOLDERS.CALENDAR}` },
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:${FOLDERS.TRASH}` },
			{ id: `${randomUUID}:153`, absFolderPath: TRASH_SUB_FOLDER_PATH },
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:${SIDEBAR_ITEMS.ALL_CALENDAR}` }
		])(genericTestTitleForEachCases, (item) => {
			const createSnackbar = vi.fn();
			setupFoldersStore();
			const removeFromList = removeFromListItem({ createSnackbar, item });
			expect(removeFromList).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
	});
	describe('sharesInfoItem', () => {
		test(genericTestItemTitleForIconItem, () => {
			const createModal = vi.fn();
			const closeModal = vi.fn();
			setupFoldersStore();

			const sharesInfo = sharesInfoItem({ createModal, closeModal, item: folder });
			expect(sharesInfo).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.SHARES_INFO,
					icon: 'InfoOutline',
					label: 'shares_info',
					tooltipLabel: noPermissionLabel,
					onClick: expect.any(Function),
					disabled: false
				})
			);
		});
		test.each([
			childFolder,
			{ ...mockedData.calendars.getCalendar(), id: '153' },
			{ ...mockedData.calendars.getCalendar(), id: FOLDERS.CALENDAR },
			{ ...mockedData.calendars.getCalendar(), id: FOLDERS.TRASH },
			{ id: `153`, absFolderPath: TRASH_SUB_FOLDER_PATH },
			{
				...mockedData.calendars.getCalendar(),
				id: `${FOLDERS.USER_ROOT}:${SIDEBAR_ITEMS.ALL_CALENDAR}`
			},
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:153` },
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:${FOLDERS.CALENDAR}` },
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:${FOLDERS.TRASH}` },
			{ id: `${randomUUID}:153`, absFolderPath: TRASH_SUB_FOLDER_PATH },
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:${SIDEBAR_ITEMS.ALL_CALENDAR}` }
		])(genericTestTitleForEachCases, (item) => {
			const createModal = vi.fn();
			const closeModal = vi.fn();
			setupFoldersStore();
			const sharesInfo = sharesInfoItem({ createModal, closeModal, item });
			expect(sharesInfo).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
	});
	describe('shareCalendarItem', () => {
		test(genericTestItemTitleForIconItem, () => {
			const createModal = vi.fn();
			const closeModal = vi.fn();
			setupFoldersStore();

			const shareCalendar = shareCalendarItem({ createModal, closeModal, item: childFolder });
			expect(shareCalendar).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.SHARE,
					icon: 'SharedCalendarOutline',
					label: 'action.share_calendar',
					tooltipLabel: noPermissionLabel,
					onClick: expect.any(Function),
					disabled: false
				})
			);
		});
		test.each([
			{ ...mockedData.calendars.getCalendar(), id: FOLDERS.TRASH },
			{ ...mockedData.calendars.getCalendar(), id: '154', perm: 'r' },
			{ ...mockedData.calendars.getCalendar(), id: `153`, absFolderPath: TRASH_SUB_FOLDER_PATH },
			{
				...mockedData.calendars.getCalendar(),
				id: `${FOLDERS.USER_ROOT}:${SIDEBAR_ITEMS.ALL_CALENDAR}`
			},
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:${FOLDERS.TRASH}` },
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:154`, perm: 'r' },
			{
				...mockedData.calendars.getCalendar(),
				id: `${randomUUID}:153`,
				absFolderPath: TRASH_SUB_FOLDER_PATH
			},
			{ ...mockedData.calendars.getCalendar(), id: `${randomUUID}:${SIDEBAR_ITEMS.ALL_CALENDAR}` }
		])(genericTestTitleForEachCases, (item) => {
			const createModal = vi.fn();
			const closeModal = vi.fn();
			setupFoldersStore();
			const shareCalendar = shareCalendarItem({ createModal, closeModal, item });
			expect(shareCalendar).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
	});

	describe('syncExternalCalendarItem', () => {
		test('shows last sync date when lsd is present', () => {
			const createSnackbar = vi.fn();
			const item = {
				...mockedData.calendars.getCalendar(),
				id: '888',
				f: '#y',
				lsd: 1767276900
			} as Folder & { lsd?: number };

			const syncItem = syncExternalCalendarItem({ item, createSnackbar });

			expect(syncItem).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.SYNC,
					icon: 'SyncOutline',
					label: 'label.sync',
					disabled: false,
					customComponent: expect.anything()
				})
			);
		});

		test('does not show last sync date when lsd is absent', () => {
			const createSnackbar = vi.fn();
			const item = {
				...mockedData.calendars.getCalendar(),
				id: '889',
				f: '#y'
			} as Folder & { lsd?: number };

			const syncItem = syncExternalCalendarItem({ item, createSnackbar });

			expect(syncItem).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.SYNC,
					icon: 'SyncOutline',
					label: 'label.sync',
					disabled: false,
					customComponent: expect.anything()
				})
			);
		});
	});

	describe('CalDAV dedicated actions', () => {
		test('syncCaldavCalendarItem is enabled for caldav root folders', () => {
			const createSnackbar = vi.fn();
			const item = {
				...mockedData.calendars.getCalendar(),
				id: '990',
				dsId: '10',
				dsType: 'caldav'
			} as Folder;

			const syncItem = syncCaldavCalendarItem({ item, createSnackbar });
			expect(syncItem).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.SYNC,
					label: 'label.sync',
					disabled: false
				})
			);
		});

		test('editCaldavCalendarItem has edit-name label', () => {
			const createModal = vi.fn();
			const closeModal = vi.fn();
			const item = {
				...mockedData.calendars.getCalendar(),
				id: '991',
				dsId: '11',
				dsType: 'caldav'
			} as Folder;

			const editItem = editCaldavCalendarItem({ createModal, closeModal, item });
			expect(editItem).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.EDIT,
					label: 'action.edit_name',
					disabled: false
				})
			);
		});

		test('deleteCaldavCalendarItem has permanent-delete label', () => {
			const createModal = vi.fn();
			const closeModal = vi.fn();
			const item = {
				...mockedData.calendars.getCalendar(),
				id: '992',
				dsId: '12',
				dsType: 'caldav'
			} as Folder;

			const deleteItem = deleteCaldavCalendarItem({ createModal, closeModal, item });
			expect(deleteItem).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.DELETE,
					label: 'label.delete_permanently',
					disabled: false
				})
			);
		});
	});
});
