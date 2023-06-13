/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, map } from 'lodash';
import { useCheckedFolders } from './use-checked-folders';

export const useCheckedCalendarsQuery = (): string => {
	const calendars = useCheckedFolders();
	return map(filter(calendars, ['checked', true]), (result, id) =>
		id === 0 ? `inid:"${result.id}"` : `OR inid:"${result.id}"`
	).join(' ');
};
