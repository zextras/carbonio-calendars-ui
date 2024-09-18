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
import { t } from '@zextras/carbonio-shell-ui';
import { every, find, map, reject } from 'lodash';

import { CollapsedSidebarItem } from './collapsed-sidebar-items';
import { FoldersComponent } from './custom-components/folders-component';
import { SharesComponent } from './custom-components/shares-component';
import { SidebarAccordionMui } from '../../carbonio-ui-commons/components/sidebar/sidebar-accordion-mui';
import { FOLDER_VIEW } from '../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { useInitializeFolders } from '../../carbonio-ui-commons/hooks/use-initialize-folders';
import { getCalendarGroups, useRootsArray } from '../../carbonio-ui-commons/store/zustand/folder';
import { themeMui } from '../../carbonio-ui-commons/theme/theme-mui';
import { CalendarGroups, Folder, LinkFolder } from '../../carbonio-ui-commons/types';
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

const useSidebarSortedFolders = (folders: Array<Folder>, groups: CalendarGroups): Array<Folder> =>
	useMemo(
		() =>
			map(folders, (accountRoot) => {
				const calendarGroups = groups.map((group) => {
					const allCalendarsId = 'a970bb9528c94c40bd51bfede60fcb31';
					const name =
						group.id === allCalendarsId ? t('label.all_calendars', 'All calendars') : group.name;

					const subItems = accountRoot.children.filter((folder) =>
						group.calendarId.includes(folder.id)
					);

					return {
						id: group.id,
						name,
						children: subItems,
						checked: every(subItems, ['checked', true]),
						uuid: '',
						activesyncdisabled: true,
						recursive: false,
						deletable: false,
						isLink: false,
						depth: 0,
						reminder: false,
						broken: false
					} as Folder;
				});
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

				return calendarGroups && calendar && trash
					? {
							...accountRoot,
							children: [
								{
									id: 'calendars',
									name: t('label.app_name', 'Calendars'),
									children: [calendar, trash, ...others],
									noIcon: true
								} as Folder,
								{
									id: 'groups',
									name: t('label.calendar_groups', 'Calendar Groups'),
									children: calendarGroups,
									noIcon: true
								} as Folder
							]
						}
					: accountRoot;
			}),
		[folders, groups]
	);

const Sidebar: FC<SidebarProps> = ({ expanded }) => {
	useInitializeFolders(FOLDER_VIEW.appointment);

	const folders = useRootsArray();
	const folderWithShares = useMemo(() => addFindSharesItem(folders), [folders]);
	const calendarGroups = getCalendarGroups();
	const fullFolderTree = useSidebarSortedFolders(folderWithShares, calendarGroups);

	const tagsAccordionItems = useGetTagsAccordion();

	return (
		<ModalManager>
			<SnackbarManager>
				<ThemeProvider theme={themeMui}>
					{expanded ? (
						<MemoSidebar
							foldersAccordionItems={fullFolderTree}
							tagsAccordionItems={tagsAccordionItems}
						/>
					) : (
						folders[0].children.map((folder) => (
							<CollapsedSidebarItem key={folder.id} item={folder} />
						))
					)}
				</ThemeProvider>
			</SnackbarManager>
		</ModalManager>
	);
};

export default Sidebar;
