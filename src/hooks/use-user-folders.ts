/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS, LinkFolder, ROOT_NAME } from '@zextras/carbonio-shell-ui';
import { reject } from 'lodash';

import {
	getRootAccountId,
	useFoldersArray,
	useFoldersArrayByRoot
} from '../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../carbonio-ui-commons/types/folder';

export const useUserFolders = (calendarId: string): Array<Folder> => {
	const rootAccountId = getRootAccountId(calendarId);

	const allCalendarsByRoot = useFoldersArrayByRoot(rootAccountId ?? FOLDERS.USER_ROOT);
	const allCalendars = useFoldersArray();

	return reject(
		rootAccountId?.includes(':') ? allCalendarsByRoot : allCalendars,
		(item) => item.name === ROOT_NAME || (item as LinkFolder).oname === ROOT_NAME
	);
};
