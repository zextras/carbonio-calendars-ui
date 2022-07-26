/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { createFolderRequest } from '../../soap/create-folder-request';
import { extractCalendars } from '../../utils/store/calendars';

export const createCalendar = createAsyncThunk(
	'calendars/create',
	async ({ name, parent, color, excludeFreeBusy }: any, { requestId }) => {
		const { folder } = await createFolderRequest({ name, parent, color, excludeFreeBusy });
		return [extractCalendars(folder), requestId];
	}
);
