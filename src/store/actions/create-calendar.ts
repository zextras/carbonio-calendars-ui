/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createFolderRequest } from '../../soap/create-folder-request';
import { extractCalendars } from '../../utils/store/calendars';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createCalendar = async ({
	name,
	parent,
	color,
	excludeFreeBusy
}: any): Promise<any> => {
	const res = await createFolderRequest({ name, parent, color, excludeFreeBusy });
	if (res.folder) {
		return extractCalendars(res.folder);
	}
	return res;
};
