/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AccordionItemType } from '@zextras/carbonio-design-system';
import { FOLDERS, ROOT_NAME, t } from '@zextras/carbonio-shell-ui';
import { every, filter, forEach, map, reject } from 'lodash';
import { Folder } from '../../carbonio-ui-commons/types/folder';
import { getFolderIcon } from '../../commons/utilities';
import { SIDEBAR_ITEMS } from '../../constants/sidebar';
import { FoldersComponent } from './custom-components/folders-component';
import { SharesComponent } from './custom-components/shares-component';

export function addAllCalendarsItem({ folders }: { folders: Array<Folder> }): Array<Folder> {
	const result: Array<Folder> = [];
	folders.forEach((folder) => {
		const subItems = reject(
			folder.children,
			(c) =>
				c?.parent === FOLDERS.TRASH || c?.id === FOLDERS.TRASH || c.isLink || c.name === ROOT_NAME
		);
		const allItems = {
			name: t('label.all_calendars', 'All calendars'),
			id: SIDEBAR_ITEMS.ALL_CALENDAR,
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
		folder.children.unshift(allItems);
		result.push(folder);
	});
	return result;
}

type GetSharesItemChildrenProps = {
	folders: Array<Folder>;
	onClick: (item: Folder) => void;
};

export function getSharesItemChildren({
	folders,
	onClick
}: GetSharesItemChildrenProps): Array<AccordionItemType> {
	const children: Array<AccordionItemType> = [];

	const flattenSharesItems = (items: Array<Folder>): void => {
		forEach(items, (item) => {
			if (item?.isLink) {
				children.push({
					...item,
					items: [],
					label: item.name,
					icon: getFolderIcon({ item, checked: item.checked ?? false }),
					onClick: () => onClick(item),
					CustomComponent: FoldersComponent as AccordionItemType['CustomComponent']
				});
			}
			if (item?.children.length > 0) flattenSharesItems(item.children);
		});
	};
	flattenSharesItems(folders);

	const result = [
		...children,
		{
			id: 'find-shares-button',
			CustomComponent: SharesComponent,
			disableHover: true
		}
	];
	return result;
}

type ComposeSharesAccordionItemsProps = {
	folders: Array<Folder>;
	onClick: (folder: Folder) => void;
};

export function composeSharesAccordionItems({
	folders,
	onClick
}: ComposeSharesAccordionItemsProps): AccordionItemType {
	const mainAccountFolders = [folders[0]];
	const items = getSharesItemChildren({ folders: mainAccountFolders, onClick });
	return {
		id: SIDEBAR_ITEMS.SHARES,
		label: t('shared_folders', 'Shared Calendars'),
		icon: 'Share',
		open: false,
		items
	};
}

export function removeLinkFolders({ folders }: { folders: Array<Folder> }): Array<Folder> {
	const folderItems = filter(folders, (folder) => !folder.isLink);
	const folderItemsChildren = filter(folderItems?.[0]?.children, (folder) => !folder.isLink);
	const result = map(folderItems, (folder) => ({
		...folder,
		children: folderItemsChildren
	}));
	return result;
}
