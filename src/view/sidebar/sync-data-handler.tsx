/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useSyncDataHandler } from './use-sync-data-handler';

export const SyncDataHandler = (): React.JSX.Element => {
	useSyncDataHandler();
	return <></>;
};
