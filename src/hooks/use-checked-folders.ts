/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { useFoldersMap, Folder } from '@zextras/carbonio-ui-commons';
import { filter } from 'lodash';

export const useCheckedFolders = (): Array<Folder> => {
	const calendars = useFoldersMap();

	return useMemo(() => filter(calendars, ['checked', true]), [calendars]);
};
