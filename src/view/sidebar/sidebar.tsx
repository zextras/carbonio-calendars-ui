/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ThemeProvider } from '@mui/material';
import {
	Accordion,
	AccordionItemType,
	Container,
	Divider,
	ModalManager,
	SnackbarManager
} from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useState } from 'react';
import { SidebarAccordionMui } from '../../carbonio-ui-commons/components/sidebar/sidebar-accordion-mui';
import { useRootsArray } from '../../carbonio-ui-commons/store/zustand/folder';
import { themeMui } from '../../carbonio-ui-commons/theme/theme-mui';
import { Folder } from '../../carbonio-ui-commons/types/folder';
import { SidebarProps } from '../../carbonio-ui-commons/types/sidebar';
import { recursiveToggleCheck } from '../../commons/utilities';
import { CollapsedSidebarItems } from './collapsed-sidebar-items';
import { FoldersComponent } from './custom-components/folders-component';
import {
	addAllCalendarsItem,
	composeSharesAccordionItems as getSharesAccordionItems,
	removeLinkFolders
} from './utils';
import useGetTagsAccordion from '../tags/use-get-tags-accordions';

type SidebarComponentProps = {
	foldersAccordionItems: Folder[];
	sharesAccordionItems: AccordionItemType;
	tagsAccordionItems: AccordionItemType;
};

const SidebarComponent: FC<SidebarComponentProps> = ({
	foldersAccordionItems,
	sharesAccordionItems,
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
				setSelectedFolder={setSelectedFolder}
			/>
			<Divider />
			<Accordion items={[tagsAccordionItems]} />
			<Divider />
			<Accordion items={[sharesAccordionItems]} />
		</Container>
	);
};
const MemoSidebar: FC<SidebarComponentProps> = React.memo(SidebarComponent);

const Sidebar: FC<SidebarProps> = ({ expanded }) => {
	const folders = useRootsArray();

	const folderItems = removeLinkFolders({ folders });

	const foldersAccordionItems = addAllCalendarsItem({ folders: folderItems });

	const sharesItemsOnClick = useCallback(
		(folder: Folder): void =>
			recursiveToggleCheck({
				folder,
				checked: !!folder.checked
			}),
		[]
	);

	const sharesAccordionItems = getSharesAccordionItems({
		folders,
		onClick: sharesItemsOnClick
	});

	const tagsAccordionItems = useGetTagsAccordion();

	return (
		<ModalManager>
			<SnackbarManager>
				<ThemeProvider theme={themeMui}>
					{expanded ? (
						<MemoSidebar
							foldersAccordionItems={foldersAccordionItems}
							sharesAccordionItems={sharesAccordionItems}
							tagsAccordionItems={tagsAccordionItems}
						/>
					) : (
						foldersAccordionItems[0].children.map((folder) => (
							<CollapsedSidebarItems key={folder.id} item={folder} />
						))
					)}
				</ThemeProvider>
			</SnackbarManager>
		</ModalManager>
	);
};

export default Sidebar;
