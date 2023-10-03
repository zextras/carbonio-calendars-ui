/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { FOLDERS, t } from '@zextras/carbonio-shell-ui';

import {
	editCalendarItem,
	emptyTrashItem,
	moveToRootItem,
	newCalendarItem,
	noPermissionLabel
} from './calendar-actions-items';
import { useFolderStore } from '../carbonio-ui-commons/store/zustand/folder';
import { generateRoots } from '../carbonio-ui-commons/test/mocks/folders/roots-generator';
import { Folder, FolderView } from '../carbonio-ui-commons/types/folder';
import { FOLDER_ACTIONS, SIDEBAR_ITEMS } from '../constants/sidebar';

const randomUUID = faker.datatype.uuid();
const TRASH_SUB_FOLDER_PATH = '/Trash/subFolder';
const genericTestItemTitleForIconItem =
	'is an item with properties id, icon, label, tooltipLabel, onClick, disabled';
const genericTestTitleForEachCases = 'return disabled set to true when %o';
const trashEmptyLabel = t('action.empty_trash', 'Empty Trash');
const trashTooltipLabel = 'action.Trash_already_empty';

const roots = generateRoots();
const childFolder = {
	absFolderPath: '/calendar 1/child',
	id: `${randomUUID}:${FOLDERS.CALENDAR}`,
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
	absFolderPath: '/calendar 1',
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
			const createModal = jest.fn();

			const newItem = newCalendarItem({ createModal, item });
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
			{ id: `153`, absFolderPath: TRASH_SUB_FOLDER_PATH },
			{ id: '154', perm: 'r' },
			{ id: `${randomUUID}:${FOLDERS.TRASH}` },
			{ id: `${randomUUID}:153`, absFolderPath: TRASH_SUB_FOLDER_PATH },
			{ id: `${randomUUID}:154`, perm: 'r' }
		])(genericTestTitleForEachCases, (item) => {
			const createModal = jest.fn();

			const newItem = newCalendarItem({ createModal, item });
			expect(newItem).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
	});
	describe('editCalendarItem', () => {
		test(genericTestItemTitleForIconItem, () => {
			const item = { id: FOLDERS.CALENDAR, absFolderPath: '/Calendar' };
			const createModal = jest.fn();

			const editItem = editCalendarItem({ createModal, item });
			expect(editItem).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.EDIT,
					icon: 'Edit2Outline',
					label: t('action.edit_calendar_properties', 'Edit calendar properties'),
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
			const createModal = jest.fn();

			const editItem = editCalendarItem({ createModal, item });
			expect(editItem).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
	});
	describe('moveToRootItem', () => {
		test(genericTestItemTitleForIconItem, () => {
			const item = { id: '10', absFolderPath: '/Calendar', depth: 1 };
			const createSnackbar = jest.fn();

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
			const createSnackbar = jest.fn();
			setupFoldersStore();

			const moveToRoot = moveToRootItem({ createSnackbar, item });
			expect(moveToRoot).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
		test('return label "label.restore_calendar" if nested in trash', () => {
			const createSnackbar = jest.fn();
			const item = { id: '152', depth: 2, absFolderPath: TRASH_SUB_FOLDER_PATH };
			const moveToRoot = moveToRootItem({ createSnackbar, item });
			expect(moveToRoot).toStrictEqual(
				expect.objectContaining({
					label: 'label.restore_calendar'
				})
			);
		});
		test('return label "action.move_to_root" if not nested in trash', () => {
			const createSnackbar = jest.fn();
			const item = { id: '152', depth: 2 };
			const moveToRoot = moveToRootItem({ createSnackbar, item });
			expect(moveToRoot).toStrictEqual(
				expect.objectContaining({
					label: 'action.move_to_root'
				})
			);
		});
	});
	describe('emptyTrashItem', () => {
		test(genericTestItemTitleForIconItem, () => {
			const item = { id: FOLDERS.TRASH, n: 2, children: [] };
			const createModal = jest.fn();

			const empty = emptyTrashItem({ createModal, item });
			expect(empty).toStrictEqual(
				expect.objectContaining({
					id: FOLDER_ACTIONS.EMPTY_TRASH,
					icon: 'SlashOutline',
					label: trashEmptyLabel,
					tooltipLabel: noPermissionLabel,
					onClick: expect.any(Function),
					disabled: false
				})
			);
		});
		test('return tooltipLabel "trash is already empty" when n is 0 and children is an empty array', () => {
			const trash = { id: FOLDERS.TRASH, n: 0, children: [] };
			const createModal = jest.fn();

			const empty = emptyTrashItem({ createModal, item: trash });
			expect(empty).toStrictEqual(
				expect.objectContaining({
					tooltipLabel: trashTooltipLabel
				})
			);
		});
		test('return disabled set to true when folder is not trash', () => {
			const trash = { id: FOLDERS.CALENDAR, n: 1, children: [] };
			const createModal = jest.fn();

			const empty = emptyTrashItem({ createModal, item: trash });
			expect(empty).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
		test('return disabled set to true when n === 0 and children.length === 0', () => {
			const trash = { id: FOLDERS.TRASH, n: 0, children: [] };
			const createModal = jest.fn();

			const empty = emptyTrashItem({ createModal, item: trash });
			expect(empty).toStrictEqual(
				expect.objectContaining({
					disabled: true
				})
			);
		});
		test('return disabled set to false when n > 0', () => {
			const trash = { id: FOLDERS.TRASH, n: 1, children: [] };
			const createModal = jest.fn();

			const empty = emptyTrashItem({ createModal, item: trash });
			expect(empty).toStrictEqual(
				expect.objectContaining({
					disabled: false
				})
			);
		});
		test('return disabled set to false when children.length > 0', () => {
			const trash = { id: FOLDERS.TRASH, n: 0, children: [{ id: '1235' } as Folder] };
			const createModal = jest.fn();

			const empty = emptyTrashItem({ createModal, item: trash });
			expect(empty).toStrictEqual(
				expect.objectContaining({
					disabled: false
				})
			);
		});
	});
});
