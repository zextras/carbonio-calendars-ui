/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, map } from 'lodash';

import { useCheckedFolders } from './use-checked-folders';
import { LinkFolder } from '../carbonio-ui-commons/types/folder';

export const useCheckedCalendarsQuery = (): string => {
	const calendars = useCheckedFolders();
	return map(
		filter(calendars, (calendar) => calendar.checked === true && !(calendar as LinkFolder).broken),
		(result, id) => (id === 0 ? `inid:"${result.id}"` : `OR inid:"${result.id}"`)
	).join(' ');
};
