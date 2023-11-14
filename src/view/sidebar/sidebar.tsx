/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useMemo, useState } from 'react';

import { ThemeProvider } from '@mui/material';
import {
	Accordion,
	AccordionItemType,
	Container,
	Divider,
	ModalManager,
	SnackbarManager
} from '@zextras/carbonio-design-system';
import { FOLDERS } from '@zextras/carbonio-shell-ui';
import { find, map, reject } from 'lodash';

import { CollapsedSidebarItem } from './collapsed-sidebar-items';
import { FoldersComponent } from './custom-components/folders-component';
import { SharesComponent } from './custom-components/shares-component';
import { addAllCalendarsItem } from './utils';
import { SidebarAccordionMui } from '../../carbonio-ui-commons/components/sidebar/sidebar-accordion-mui';
import { useRootsArray } from '../../carbonio-ui-commons/store/zustand/folder';
import { themeMui } from '../../carbonio-ui-commons/theme/theme-mui';
import { Folder, LinkFolder } from '../../carbonio-ui-commons/types/folder';
import { SidebarProps } from '../../carbonio-ui-commons/types/sidebar';
import { hasId } from '../../carbonio-ui-commons/worker/handle-message';
import { SIDEBAR_ITEMS } from '../../constants/sidebar';
import useGetTagsAccordion from '../tags/use-get-tags-accordions';

type SidebarComponentProps = {
	foldersAccordionItems: Folder[];
	tagsAccordionItems: AccordionItemType;
};

const SidebarComponent: FC<SidebarComponentProps> = ({
	foldersAccordionItems,
	tagsAccordionItems
}) => {
	const [selectedFolder, setSelectedFolder] = useState<string>('');

	return (
		<Container orientation="vertical" height="fit" width="fill">
			<SidebarAccordionMui
				accordions={foldersAccordionItems}
				folderId={selectedFolder}
				localStorageName="open_calendars_folders"
				AccordionCustomComponent={FoldersComponent}
				buttonFindShares={<SharesComponent key={'calendar-find-share'} />}
				setSelectedFolder={setSelectedFolder}
			/>
			<Divider />
			<Accordion items={[tagsAccordionItems]} />
		</Container>
	);
};
const MemoSidebar: FC<SidebarComponentProps> = React.memo(SidebarComponent);

const addFindSharesItem = (foldersAccordionItems: Array<Folder>): Array<Folder> =>
	foldersAccordionItems?.length > 0
		? [
				{
					...(foldersAccordionItems?.[0] ?? {}),
					children: [
						...(foldersAccordionItems?.[0]?.children ?? []),
						{
							id: 'find_shares',
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							disableHover: true
						}
					]
				},
				...(reject(foldersAccordionItems, ['id', '1']) ?? [])
		  ]
		: [];

const useSidebarSortedFolders = (folders: Array<Folder>): Array<Folder> =>
	useMemo(
		() =>
			map(folders, (accountRoot) => {
				const allCalendarFolder = find(accountRoot.children, (child) =>
					hasId(child, SIDEBAR_ITEMS.ALL_CALENDAR)
				);
				const calendar = find(accountRoot.children, (f) => hasId(f, FOLDERS.CALENDAR));
				const trash = find(accountRoot.children, (f) => hasId(f, FOLDERS.TRASH));
				const others = reject(
					accountRoot.children,
					(f) =>
						hasId(f, SIDEBAR_ITEMS.ALL_CALENDAR) ||
						hasId(f, FOLDERS.CALENDAR) ||
						hasId(f, FOLDERS.TRASH) ||
						(f as LinkFolder)?.broken === true
				);
				return allCalendarFolder && calendar && trash
					? {
							...accountRoot,
							children: [allCalendarFolder, calendar, trash, ...others]
					  }
					: accountRoot;
			}),
		[folders]
	);

const Sidebar: FC<SidebarProps> = ({ expanded }) => {
	const folders = useRootsArray();

	const foldersAccordionItems = useMemo(() => addAllCalendarsItem(folders), [folders]);
	const folderAccordionItemsWithFindShares = useMemo(
		() => addFindSharesItem(foldersAccordionItems),
		[foldersAccordionItems]
	);

	const tagsAccordionItems = useGetTagsAccordion();

	const sortedFolders = useSidebarSortedFolders(folderAccordionItemsWithFindShares);

	return (
		<ModalManager>
			<SnackbarManager>
				<ThemeProvider theme={themeMui}>
					{expanded ? (
						<MemoSidebar
							foldersAccordionItems={sortedFolders}
							tagsAccordionItems={tagsAccordionItems}
						/>
					) : (
						foldersAccordionItems[0].children.map((folder) => (
							<CollapsedSidebarItem key={folder.id} item={folder} />
						))
					)}
				</ThemeProvider>
			</SnackbarManager>
		</ModalManager>
	);
};

export default Sidebar;
