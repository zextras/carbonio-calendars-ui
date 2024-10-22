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
import { find, map, reject } from 'lodash';

import { CollapsedSidebarItem } from './collapsed-sidebar-items';
import { FoldersComponent } from './custom-components/folders-component';
import { FOLDER_VIEW } from '../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { useInitializeFolders } from '../../carbonio-ui-commons/hooks/use-initialize-folders';
import { getCalendarGroups, useRootsArray } from '../../carbonio-ui-commons/store/zustand/folder';
import { themeMui } from '../../carbonio-ui-commons/theme/theme-mui';
import { CalendarGroup, CalendarGroups, Folder, LinkFolder } from '../../carbonio-ui-commons/types';
import { SidebarProps } from '../../carbonio-ui-commons/types/sidebar';
import { hasId } from '../../carbonio-ui-commons/worker/handle-message';
import { SIDEBAR_ITEMS, SIDEBAR_ROOT_SUBSECTION } from '../../constants/sidebar';
import useGetTagsAccordion from '../tags/use-get-tags-accordions';

type SidebarComponentProps = {
	foldersAccordionItems: Array<Folder | CalendarGroup>;
	tagsAccordionItems: AccordionItemType;
};

const SidebarComponent: FC<SidebarComponentProps> = ({
	foldersAccordionItems,
	tagsAccordionItems
}) => {
	const [selectedFolder, setSelectedFolder] = useState<string>('');

	return (
		<Container orientation="vertical" height="fit" width="fill">
			{/* <SidebarAccordionMui
				accordions={foldersAccordionItems}
				folderId={selectedFolder}
				localStorageName="open_calendars_folders"
				AccordionCustomComponent={FoldersComponent}
				buttonFindShares={<SharesComponent key={'calendar-find-share'} />}
				buttonCreateGroup={<CreateGroupComponent key={'calendar-create-group'} />}
				setSelectedFolder={setSelectedFolder}
			/> */}
			<Accordion items={foldersAccordionItems} />
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

const useSidebarSortedFolders = (
	folders: Array<Folder>,
	groups: CalendarGroups
): Array<Folder | CalendarGroup> =>
	useMemo(
		() =>
			map(folders, (accountRoot) => {
				const calendarGroups: CalendarGroups = groups.map((group) => {
					const allCalendarsId = 'a970bb9528c94c40bd51bfede60fcb31';
					const name =
						group.id === allCalendarsId ? t('label.all_calendars', 'All calendars') : group.name;

					return {
						...group,
						items: [],
						CustomComponent: FoldersComponent,
						name
					};
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
					? ({
							...accountRoot,
							label: accountRoot.name,
							CustomComponent: FoldersComponent,
							items: [
								{
									id: SIDEBAR_ROOT_SUBSECTION.CALENDARS,
									label: t('label.app_name', 'Calendars'),
									CustomComponent: FoldersComponent,
									items: [{ ...calendar, CustomComponent: FoldersComponent }, trash, ...others]
								},
								{
									id: SIDEBAR_ROOT_SUBSECTION.GROUPS,
									CustomComponent: FoldersComponent,
									label: t('label.calendar_groups', 'Calendar Groups'),
									items: [
										...calendarGroups,
										{
											id: 'create_group',
											// eslint-disable-next-line @typescript-eslint/ban-ts-comment
											// @ts-ignore
											disableHover: true
										}
									]
								}
							]
						} satisfies AccordionItemType)
					: accountRoot;
			}),
		[folders, groups]
	);

const Sidebar: FC<SidebarProps> = ({ expanded }) => {
	useInitializeFolders(FOLDER_VIEW.appointment);

	const folders = useRootsArray();
	const folderWithShares = useMemo(() => addFindSharesItem(folders), [folders]);
	const calendarGroups = getCalendarGroups();
	const fullFolderTree: Array<Folder | CalendarGroup> = useSidebarSortedFolders(
		folderWithShares,
		calendarGroups
	);

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
