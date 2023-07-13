/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { filter, reject } from 'lodash';
import { useMemo } from 'react';
import { getFoldersArrayByRoot } from '../carbonio-ui-commons/store/zustand/folder';
import { Folder, LinkFolder } from '../carbonio-ui-commons/types/folder';

export const useCheckedFolders = (): Array<Folder> => {
	// todo: This selector is ignoring shared accounts. Replace with useFoldersArray once shared accounts will be available.
	// REFS: IRIS-2589
	const allCalendars = getFoldersArrayByRoot(FOLDERS.USER_ROOT);
	const calendars = reject(
		allCalendars,
		(item) => item.name === 'USER_ROOT' || (item as LinkFolder).oname === 'USER_ROOT'
	);

	return useMemo(() => filter(calendars, ['checked', true]), [calendars]);
};
