/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { filter } from 'lodash';

import { useFoldersMap } from '@zextras/carbonio-ui-commons';
import { Folder } from '@zextras/carbonio-ui-commons';

export const useCheckedFolders = (): Array<Folder> => {
	const calendars = useFoldersMap();

	return useMemo(() => filter(calendars, ['checked', true]), [calendars]);
};
