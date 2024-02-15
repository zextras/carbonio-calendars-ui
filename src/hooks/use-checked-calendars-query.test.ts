/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useCheckedCalendarsQuery } from './use-checked-calendars-query';
import { useFolderStore } from '../carbonio-ui-commons/store/zustand/folder';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';
import { Folder } from '../carbonio-ui-commons/types/folder';
import mockedData from '../test/generators';

const acceptedFolder = mockedData.calendars.getCalendar({ checked: true });
const brokenFolder = mockedData.calendars.getCalendar({ broken: true, checked: true });
const uncheckedFolder = mockedData.calendars.getCalendar({ checked: false });
const userRootFolder = mockedData.calendars.getCalendar({
	id: '1',
	uuid: '1234567',
	name: 'USER_ROOT',
	absFolderPath: '/',
	l: '11',
	checked: true,
	isLink: false,
	children: [acceptedFolder],
	depth: 0
});

const setupFoldersStore = (folderToTest: Folder): void => {
	useFolderStore.setState(() => ({
		roots: {
			USER: { ...userRootFolder, children: [...userRootFolder.children, folderToTest] }
		},
		folders: {
			[userRootFolder.id]: userRootFolder,
			[acceptedFolder.id]: acceptedFolder,
			[folderToTest.id]: folderToTest
		}
	}));
};

const setupEmptyFoldersStore = (): void => {
	useFolderStore.setState(() => ({
		roots: {},
		folders: {}
	}));
};

describe('use checked calendars query', () => {
	test('if there is a broken calendar it will not be parsed in the query', () => {
		setupFoldersStore(brokenFolder);
		const { result } = setupHook(useCheckedCalendarsQuery);

		expect(result.current).toBe(`inid:"${userRootFolder.id}" OR inid:"${acceptedFolder.id}"`);
	});
	test('if there is an unchecked calendar it will not be parsed in the query', () => {
		setupFoldersStore(uncheckedFolder);
		const { result } = setupHook(useCheckedCalendarsQuery);

		expect(result.current).toBe(`inid:"${userRootFolder.id}" OR inid:"${acceptedFolder.id}"`);
	});
	test('if there is not a checked calendar the query will return an empty string', () => {
		setupEmptyFoldersStore();
		const { result } = setupHook(useCheckedCalendarsQuery);

		expect(result.current).toBe('');
	});
});
