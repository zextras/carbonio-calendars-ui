/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Folder, useFolders } from '@zextras/carbonio-shell-ui';
import { filter } from 'lodash';
import { useMemo } from 'react';

export const useCalendarFolders = (): Array<Folder> => {
	const folders = useFolders();
	return useMemo(() => filter(folders, ['view', 'appointment']), [folders]);
};
