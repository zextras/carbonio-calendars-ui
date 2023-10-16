/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { t } from '@zextras/carbonio-shell-ui';
import { every, reject } from 'lodash';

import { isTrashOrNestedInIt } from '../../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder } from '../../carbonio-ui-commons/types/folder';
import { SIDEBAR_ITEMS } from '../../constants/sidebar';

export function addAllCalendarsItem(folders: Array<Folder>): Array<Folder> {
	return folders.map((folder) => {
		const subItems = reject(folder.children, (c) => isTrashOrNestedInIt(c));
		const allItems = {
			name: t('label.all_calendars', 'All calendars'),
			id: `${folder.id}:${SIDEBAR_ITEMS.ALL_CALENDAR}`,
			children: subItems,
			checked: every(subItems, ['checked', true]),
			uuid: '',
			activesyncdisabled: false,
			recursive: true,
			deletable: false,
			isLink: false,
			depth: 0,
			reminder: false,
			broken: false
		};
		return folder?.children?.length > 0
			? { ...folder, children: [allItems, ...folder.children] }
			: folder;
	});
}
