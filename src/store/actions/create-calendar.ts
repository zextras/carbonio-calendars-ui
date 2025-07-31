/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createFolderRequest } from '../../soap/create-folder-request';
import { RequestFolder } from 'types/soap/createFolder';

type CreateCalendarRequest = {
	name: string;
	parent: '1';
	color: number;
	excludeFreeBusy: boolean;
};

export const createCalendar = async ({
	name,
	parent,
	color,
	excludeFreeBusy
}: CreateCalendarRequest): Promise<any> => {
	const reqActionParams: RequestFolder = {
		color,
		f: excludeFreeBusy ? 'b#' : '#',
		l: parent,
		name,
		view: 'appointment'
	};
	const res = await createFolderRequest(reqActionParams);
	if (res.folder) {
		return res.folder[0];
	}
	return res;
};
