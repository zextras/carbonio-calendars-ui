/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';

import { getShareInfoRequest } from '../../soap/get-share-info-request';

export const getShareInfo = createAsyncThunk(
	'calendar/get share info',
	async (): Promise<any> => getShareInfoRequest()
);
