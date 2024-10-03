/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useLocalStorage } from '@zextras/carbonio-shell-ui';

const LOCAL_STORAGE_KEY = 'calendars_split_view';

export const useSplitViewPrefs = (): [boolean, ReturnType<typeof useLocalStorage<boolean>>[1]] =>
	useLocalStorage<boolean>(LOCAL_STORAGE_KEY, false, { keepSyncedWithStorage: true });
