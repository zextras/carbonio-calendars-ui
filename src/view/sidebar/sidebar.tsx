/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useMemo, useState } from 'react';

import { ThemeProvider } from '@zextras/carbonio-design-system';
import {
	Accordion,
	AccordionItemType,
	Container,
	Divider,
	ModalManager,
	SnackbarManager
} from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';
import {
	FOLDER_VIEW,
	ROOT_NAME,
	FOLDERS,
	useInitializeFolders,
	useRootsArray,
	Folder,
	LinkFolder,
	SidebarProps,
	hasId,
	themeMuiExtension
} from '@zextras/carbonio-ui-commons';
import { compact, find, map, reject, sortBy } from 'lodash';

import { CollapsedSidebarItem } from './collapsed-sidebar-items';
import { CreateGroupComponent } from './custom-components/create-group-component';
import { FoldersComponent } from './custom-components/folders-component';
import { SharesComponent } from './custom-components/shares-component';
import { SidebarAccordionMui } from './custom-components/sidebar-accordion-mui';
import { SIDEBAR_ITEMS, SIDEBAR_ROOT_SUBSECTION } from '../../constants/sidebar';
import { CalendarGroup, useCalendarGroups } from '../../store/zustand/calendar-group-store';
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
			<SidebarAccordionMui
				accordions={foldersAccordionItems}
				folderId={selectedFolder}
				localStorageName="open_calendars_folders"
				AccordionCustomComponent={FoldersComponent}
				buttonFindShares={<SharesComponent key={'calendar-find-share'} />}
				buttonCreateGroup={<CreateGroupComponent key={'calendar-create-group'} />}
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

const useSidebarSortedFolders = (
	folders: Array<Folder>,
	groups: Record<string, CalendarGroup>
): Array<Folder | CalendarGroup> =>
	useMemo(
		() =>
			map(folders, (accountRoot) => {
				const allCalendars = find(groups, ['id', SIDEBAR_ITEMS.ALL_CALENDAR]);
				const otherGroups = reject(groups, ['id', SIDEBAR_ITEMS.ALL_CALENDAR]);
				const sortedGroups = compact([
					allCalendars,
					...sortBy(otherGroups, (group) => group.name.toLowerCase())
				]);
				const calendarGroups = map(sortedGroups, (group) => {
					const name =
						group.id === SIDEBAR_ITEMS.ALL_CALENDAR
							? t('label.all_calendars', 'All calendars')
							: group.name;

					return {
						...group,
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

				return calendarGroups && calendar && trash && accountRoot.name === ROOT_NAME
					? {
							...accountRoot,
							children: [
								{
									id: SIDEBAR_ROOT_SUBSECTION.CALENDARS,
									name: t('label.calendars', 'Calendars'),
									children: [calendar, trash, ...others],
									noIcon: true
								},
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								{
									id: SIDEBAR_ROOT_SUBSECTION.GROUPS,
									name: t('label.calendar_groups', 'Calendar groups'),
									children: [
										...calendarGroups,
										{
											id: 'create_group',
											// eslint-disable-next-line @typescript-eslint/ban-ts-comment
											// @ts-ignore
											disableHover: true
										}
									],
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
	const calendarGroups = useCalendarGroups();
	const fullFolderTree: Array<Folder | CalendarGroup> = useSidebarSortedFolders(
		folderWithShares,
		calendarGroups
	);

	const tagsAccordionItems = useGetTagsAccordion();

	return (
		<ModalManager>
			<SnackbarManager>
				<ThemeProvider extension={themeMuiExtension}>
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
