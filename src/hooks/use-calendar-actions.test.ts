/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { t } from '@zextras/carbonio-shell-ui';

import { useCalendarActions } from './use-calendar-actions';
import { useFolderStore } from '../carbonio-ui-commons/store/zustand/folder';
import { FOLDERS } from '../carbonio-ui-commons/test/mocks/carbonio-shell-ui';
import { generateRoots } from '../carbonio-ui-commons/test/mocks/folders/roots-generator';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';
import { Folder, FolderView } from '../carbonio-ui-commons/types/folder';
import { FOLDER_ACTIONS, SIDEBAR_ITEMS } from '../constants/sidebar';

const randomUUID = faker.string.uuid();
const roots = generateRoots();

const sharedChildFolder = {
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

const sharedFolder = {
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
	children: [sharedChildFolder],
	reminder: false,
	broken: false,
	acl: {
		grant: []
	},
	perm: 'rwixda'
};

const mainChildFolder = {
	absFolderPath: '/Calendar 1/Calendar child',
	id: `${randomUUID}:153`,
	l: `${randomUUID}:2048`,
	parent: `${randomUUID}:2048`,
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

const mainFolder = {
	absFolderPath: '/Calendar 1',
	id: `${randomUUID}:2048`,
	l: FOLDERS.USER_ROOT,
	parent: FOLDERS.USER_ROOT,
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
	children: [mainChildFolder],
	reminder: false,
	broken: false,
	acl: {
		grant: []
	},
	perm: 'rwixda'
};

const setupFoldersStore = (item?: Folder, foldersToAdd?: Record<string, Folder>): void => {
	useFolderStore.setState(() => ({
		roots: {
			...roots,
			USER: {
				...roots.USER,
				children: item ? [mainFolder, item] : [mainFolder]
			}
		},
		folders: item
			? {
					[roots.USER.id]: roots.USER,
					[mainFolder.id]: mainFolder,
					[sharedFolder.id]: sharedFolder,
					[item.id]: item,
					...foldersToAdd
				}
			: {
					[roots.USER.id]: roots.USER,
					[mainFolder.id]: mainFolder,
					[sharedFolder.id]: sharedFolder
				}
	}));
};

describe('use calendar actions', () => {
	describe('allCalendar folder has 0 actions', () => {
		test('allCalendar main account', () => {
			const allItem = {
				name: t('label.all_calendars', 'All calendars'),
				id: `${FOLDERS.USER_ROOT}:${SIDEBAR_ITEMS.ALL_CALENDAR}`,
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: false,
				isLink: false,
				depth: 0,
				reminder: false,
				broken: false
			};
			const { result } = setupHook(useCalendarActions, {
				initialProps: [allItem]
			});

			expect(result.current.length).toBe(0);
			expect(result.current).toStrictEqual([]);
		});
		test('allCalendar shared account', () => {
			const allItem = {
				name: t('label.all_calendars', 'All calendars'),
				id: `${randomUUID}:${SIDEBAR_ITEMS.ALL_CALENDAR}`,
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: false,
				isLink: false,
				depth: 0,
				reminder: false,
				broken: false
			};
			const { result } = setupHook(useCalendarActions, {
				initialProps: [allItem]
			});

			expect(result.current.length).toBe(0);
			expect(result.current).toStrictEqual([]);
		});
	});
	test('main account calendar folder has 6 actions', () => {
		const calendarItem = {
			name: 'calendar',
			id: FOLDERS.CALENDAR,
			l: FOLDERS.USER_ROOT,
			parent: FOLDERS.USER_ROOT,
			children: [],
			checked: true,
			uuid: '',
			activesyncdisabled: false,
			recursive: true,
			deletable: false,
			isLink: false,
			depth: 0,
			reminder: false,
			broken: false
		};
		setupFoldersStore(calendarItem);

		const { result } = setupHook(useCalendarActions, {
			initialProps: [calendarItem]
		});

		expect(result.current.length).toBe(6);
		expect(result.current).toStrictEqual([
			expect.objectContaining({ id: FOLDER_ACTIONS.NEW }),
			expect.objectContaining({ id: FOLDER_ACTIONS.EDIT }),
			expect.objectContaining({ id: FOLDER_ACTIONS.SHARE_URL }),
			expect.objectContaining({ id: FOLDER_ACTIONS.FIND_SHARES }),
			expect.objectContaining({ id: FOLDER_ACTIONS.EXPORT_ICS }),
			expect.objectContaining({ id: FOLDER_ACTIONS.UPLOAD })
		]);
	});
	test('shared account calendar has 5 actions', () => {
		const calendarItem = {
			name: 'calendar',
			id: `${randomUUID}:${FOLDERS.CALENDAR}`,
			children: [],
			checked: true,
			uuid: '',
			activesyncdisabled: false,
			recursive: true,
			deletable: false,
			isLink: false,
			depth: 0,
			reminder: false,
			broken: false
		};

		const { result } = setupHook(useCalendarActions, {
			initialProps: [calendarItem]
		});

		expect(result.current.length).toBe(5);
		expect(result.current).toStrictEqual([
			expect.objectContaining({ id: FOLDER_ACTIONS.NEW }),
			expect.objectContaining({ id: FOLDER_ACTIONS.EDIT }),
			expect.objectContaining({ id: FOLDER_ACTIONS.SHARE_URL }),
			expect.objectContaining({ id: FOLDER_ACTIONS.EXPORT_ICS }),
			expect.objectContaining({ id: FOLDER_ACTIONS.UPLOAD })
		]);
	});
	describe('trash folder has 1 action', () => {
		test('trash main account', () => {
			const calendarItem = {
				name: 'trash',
				id: FOLDERS.TRASH,
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: false,
				isLink: false,
				depth: 0,
				reminder: false,
				broken: false
			};
			const { result } = setupHook(useCalendarActions, {
				initialProps: [calendarItem]
			});

			expect(result.current.length).toBe(1);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.EMPTY_TRASH })
			]);
		});
		test('trash shared account', () => {
			const calendarItem = {
				name: 'trash',
				id: `${randomUUID}:${FOLDERS.TRASH}`,
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: false,
				isLink: false,
				depth: 0,
				reminder: false,
				broken: false
			};
			const { result } = setupHook(useCalendarActions, {
				initialProps: [calendarItem]
			});

			expect(result.current.length).toBe(1);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.EMPTY_TRASH })
			]);
		});
	});
	describe('trashed folder has 2 actions', () => {
		test('trashed folder main account', () => {
			const trashedItem = {
				name: 'trashed folder',
				id: '154',
				absFolderPath: '/Trash/trashed folder',
				l: FOLDERS.TRASH,
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: true,
				isLink: false,
				depth: 2,
				reminder: false,
				broken: false
			};
			const { result } = setupHook(useCalendarActions, {
				initialProps: [trashedItem]
			});

			expect(result.current.length).toBe(2);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.MOVE_TO_ROOT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.DELETE })
			]);
		});
		test('trashed folder shared account', () => {
			const trashedItem = {
				name: 'trashed folder',
				id: `${randomUUID}:154`,
				absFolderPath: '/Trash/trashed folder',
				l: `${randomUUID}:${FOLDERS.TRASH}`,
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: true,
				isLink: false,
				depth: 2,
				reminder: false,
				broken: false
			};
			const { result } = setupHook(useCalendarActions, {
				initialProps: [trashedItem]
			});

			expect(result.current.length).toBe(2);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.MOVE_TO_ROOT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.DELETE })
			]);
		});
	});
	describe('custom folder has different number of actions', () => {
		test('custom folder main account', () => {
			const customItem = {
				name: 'custom folder',
				id: '154',
				absFolderPath: '/custom folder',
				l: FOLDERS.USER_ROOT,
				parent: FOLDERS.USER_ROOT,
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: true,
				isLink: false,
				depth: 1,
				reminder: false,
				broken: false
			};
			setupFoldersStore(customItem);
			const { result } = setupHook(useCalendarActions, {
				initialProps: [customItem]
			});

			expect(result.current.length).toBe(7);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.NEW }),
				expect.objectContaining({ id: FOLDER_ACTIONS.EDIT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.DELETE }),
				expect.objectContaining({ id: FOLDER_ACTIONS.SHARE_URL }),
				expect.objectContaining({ id: FOLDER_ACTIONS.FIND_SHARES }),
				expect.objectContaining({ id: FOLDER_ACTIONS.EXPORT_ICS }),
				expect.objectContaining({ id: FOLDER_ACTIONS.UPLOAD })
			]);
		});
		test('shared account', () => {
			const trashedItem = {
				name: 'custom folder',
				id: `${randomUUID}:154`,
				absFolderPath: '/custom folder',
				l: `${randomUUID}:${FOLDERS.USER_ROOT}`,
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: true,
				isLink: false,
				depth: 1,
				reminder: false,
				broken: false
			};
			const { result } = setupHook(useCalendarActions, {
				initialProps: [trashedItem]
			});

			expect(result.current.length).toBe(6);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.NEW }),
				expect.objectContaining({ id: FOLDER_ACTIONS.EDIT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.DELETE }),
				expect.objectContaining({ id: FOLDER_ACTIONS.SHARE_URL }),
				expect.objectContaining({ id: FOLDER_ACTIONS.EXPORT_ICS }),
				expect.objectContaining({ id: FOLDER_ACTIONS.UPLOAD })
			]);
		});
	});
	describe('nested custom folder', () => {
		test('in main account has 8 actions', () => {
			const customNestedItem = {
				name: 'custom nested folder',
				id: '153',
				absFolderPath: '/custom folder/custom nested folder',
				l: '154',
				parent: '154',
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: true,
				isLink: false,
				depth: 2,
				reminder: false,
				broken: false
			};

			const customItem = {
				name: 'custom folder',
				id: '154',
				absFolderPath: '/custom folder',
				l: FOLDERS.USER_ROOT,
				parent: FOLDERS.USER_ROOT,
				children: [customNestedItem],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: true,
				isLink: false,
				depth: 1,
				reminder: false,
				broken: false
			};
			setupFoldersStore(customItem, { [customNestedItem.id]: customNestedItem });

			const { result } = setupHook(useCalendarActions, {
				initialProps: [customNestedItem]
			});

			expect(result.current.length).toBe(8);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.NEW }),
				expect.objectContaining({ id: FOLDER_ACTIONS.MOVE_TO_ROOT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.EDIT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.DELETE }),
				expect.objectContaining({ id: FOLDER_ACTIONS.SHARE_URL }),
				expect.objectContaining({ id: FOLDER_ACTIONS.FIND_SHARES }),
				expect.objectContaining({ id: FOLDER_ACTIONS.EXPORT_ICS }),
				expect.objectContaining({ id: FOLDER_ACTIONS.UPLOAD })
			]);
		});
		test('in shared account has 7 actions', () => {
			const customNestedItem = {
				name: 'custom folder',
				id: `${randomUUID}:154`,
				absFolderPath: '/parent folder/custom folder',
				l: `${randomUUID}:153`,
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: true,
				isLink: false,
				depth: 2,
				reminder: false,
				broken: false
			};
			const { result } = setupHook(useCalendarActions, {
				initialProps: [customNestedItem]
			});

			expect(result.current.length).toBe(7);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.NEW }),
				expect.objectContaining({ id: FOLDER_ACTIONS.MOVE_TO_ROOT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.EDIT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.DELETE }),
				expect.objectContaining({ id: FOLDER_ACTIONS.SHARE_URL }),
				expect.objectContaining({ id: FOLDER_ACTIONS.EXPORT_ICS }),
				expect.objectContaining({ id: FOLDER_ACTIONS.UPLOAD })
			]);
		});
	});
	describe('link folder with view permission', () => {
		test('in main account has 4 actions', () => {
			const linkItem = {
				name: 'link folder',
				id: `${randomUUID}:154`,
				absFolderPath: '/link folder',
				l: '1',
				parent: '1',
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: true,
				isLink: true,
				depth: 1,
				reminder: false,
				broken: false,
				perm: 'r'
			};
			setupFoldersStore(linkItem);
			const { result } = setupHook(useCalendarActions, {
				initialProps: [linkItem]
			});

			expect(result.current.length).toBe(4);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.EDIT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.REMOVE_FROM_LIST }),
				expect.objectContaining({ id: FOLDER_ACTIONS.FIND_SHARES }),
				expect.objectContaining({ id: FOLDER_ACTIONS.SHARES_INFO })
			]);
		});
		test('link folder shared account has 3 actions', () => {
			const linkItem = {
				name: 'link folder',
				id: `${randomUUID}:154`,
				absFolderPath: '/link folder',
				l: `${randomUUID}:${FOLDERS.USER_ROOT}`,
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: true,
				isLink: true,
				depth: 1,
				reminder: false,
				broken: false,
				perm: 'r'
			};
			setupFoldersStore();
			const { result } = setupHook(useCalendarActions, {
				initialProps: [linkItem]
			});

			expect(result.current.length).toBe(3);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.EDIT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.REMOVE_FROM_LIST }),
				expect.objectContaining({ id: FOLDER_ACTIONS.SHARES_INFO })
			]);
		});
	});

	describe('link folder with admin or manager permission', () => {
		test('in main account has 6 actions', () => {
			const linkItem = {
				name: 'link folder',
				id: `${randomUUID}:154`,
				absFolderPath: '/link folder',
				l: FOLDERS.USER_ROOT,
				parent: FOLDERS.USER_ROOT,
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: true,
				isLink: true,
				depth: 1,
				reminder: false,
				broken: false,
				perm: 'rwidxa'
			};
			setupFoldersStore(linkItem);
			const { result } = setupHook(useCalendarActions, {
				initialProps: [linkItem]
			});

			expect(result.current.length).toBe(6);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.NEW }),
				expect.objectContaining({ id: FOLDER_ACTIONS.EDIT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.DELETE }),
				expect.objectContaining({ id: FOLDER_ACTIONS.REMOVE_FROM_LIST }),
				expect.objectContaining({ id: FOLDER_ACTIONS.FIND_SHARES }),
				expect.objectContaining({ id: FOLDER_ACTIONS.SHARES_INFO })
			]);
		});
		test('in shared account has 5 actions', () => {
			const linkItem = {
				name: 'link folder',
				id: `${randomUUID}:154`,
				absFolderPath: '/link folder',
				l: `${randomUUID}:${FOLDERS.USER_ROOT}`,
				children: [],
				checked: true,
				uuid: '',
				activesyncdisabled: false,
				recursive: true,
				deletable: true,
				isLink: true,
				depth: 1,
				reminder: false,
				broken: false,
				perm: 'rwidxa'
			};
			setupFoldersStore();

			const { result } = setupHook(useCalendarActions, {
				initialProps: [linkItem]
			});
			expect(result.current.length).toBe(5);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.NEW }),
				expect.objectContaining({ id: FOLDER_ACTIONS.EDIT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.DELETE }),
				expect.objectContaining({ id: FOLDER_ACTIONS.REMOVE_FROM_LIST }),
				expect.objectContaining({ id: FOLDER_ACTIONS.SHARES_INFO })
			]);
		});
	});

	describe('nested folder in link folder with admin or manager permission', () => {
		test('in main account has 5 actions', () => {
			setupFoldersStore(mainFolder, { [mainChildFolder.id]: mainChildFolder });

			const { result } = setupHook(useCalendarActions, {
				initialProps: [mainChildFolder]
			});

			expect(result.current.length).toBe(5);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.NEW }),
				expect.objectContaining({ id: FOLDER_ACTIONS.EDIT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.DELETE }),
				expect.objectContaining({ id: FOLDER_ACTIONS.SHARE_URL }),
				expect.objectContaining({ id: FOLDER_ACTIONS.FIND_SHARES })
			]);
		});

		test('in shared account has 4 actions', () => {
			setupFoldersStore();
			const { result } = setupHook(useCalendarActions, {
				initialProps: [sharedChildFolder]
			});

			expect(result.current.length).toBe(4);
			expect(result.current).toStrictEqual([
				expect.objectContaining({ id: FOLDER_ACTIONS.NEW }),
				expect.objectContaining({ id: FOLDER_ACTIONS.EDIT }),
				expect.objectContaining({ id: FOLDER_ACTIONS.DELETE }),
				expect.objectContaining({ id: FOLDER_ACTIONS.SHARE_URL })
			]);
		});
	});
});
