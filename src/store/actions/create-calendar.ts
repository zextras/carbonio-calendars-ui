/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BaseFolder } from '@zextras/carbonio-ui-soap-lib';

import { createFolderRequest } from '../../soap/create-folder-request';
import { ApiError, RequestFolder } from 'types/soap/createFolder';

type CreateCalendarRequest = {
	name: string;
	parent: '1';
	color: number;
	url?: string;
	excludeFreeBusy: boolean;
};

export const createCalendar = async ({
	name,
	parent,
	color,
	url,
	excludeFreeBusy
}: CreateCalendarRequest): Promise<BaseFolder | ApiError> => {
	const reqActionParams: RequestFolder = {
		color,
		f: excludeFreeBusy ? 'b#' : '#',
		l: parent,
		name,
		url,
		view: 'appointment'
	};
	const res = await createFolderRequest(reqActionParams);
	// TODO: what if folder is undefined? Should not happen anyway. Else means API was designed wrong or we should throw an error
	if ('folder' in res) {
		return res.folder[0];
	}
	return res;
};
