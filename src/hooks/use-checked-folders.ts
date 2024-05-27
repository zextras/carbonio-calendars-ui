/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { filter } from 'lodash';

import { useFoldersMap } from '../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../carbonio-ui-commons/types/folder';

export const useCheckedFolders = (): Array<Folder> => {
	const calendars = useFoldersMap();

	return useMemo(() => filter(calendars, ['checked', true]), [calendars]);
};
