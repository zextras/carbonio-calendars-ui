/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ThemeProvider } from '@mui/material';
import { Accordion, AccordionItemType, Container, Divider } from '@zextras/carbonio-design-system';
import React, { FC, useState } from 'react';
import { SidebarAccordionMui } from '../../carbonio-ui-commons/components/sidebar/sidebar-accordion-mui';
import { useRootsArray } from '../../carbonio-ui-commons/store/zustand/folder';
import { themeMui } from '../../carbonio-ui-commons/theme/theme-mui';
import { Folder } from '../../carbonio-ui-commons/types/folder';
import { SidebarProps } from '../../carbonio-ui-commons/types/sidebar';
import { CollapsedSidebarItems } from './collapsed-sidebar-items';
import { FoldersComponent } from './custom-components/folders-component';
import { addAllCalendarsItem } from './utils';
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
				setSelectedFolder={setSelectedFolder}
			/>
			<Divider />
			<Accordion items={[tagsAccordionItems]} />
		</Container>
	);
};
const MemoSidebar: FC<SidebarComponentProps> = React.memo(SidebarComponent);

const Sidebar: FC<SidebarProps> = ({ expanded }) => {
	const folders = useRootsArray();

	const foldersAccordionItems = addAllCalendarsItem({ folders });

	const tagsAccordionItems = useGetTagsAccordion();

	return (
		<>
			<ThemeProvider theme={themeMui}>
				{expanded ? (
					<MemoSidebar
						foldersAccordionItems={foldersAccordionItems}
						tagsAccordionItems={tagsAccordionItems}
					/>
				) : (
					foldersAccordionItems[0].children.map((folder) => (
						<CollapsedSidebarItems key={folder.id} item={folder} />
					))
				)}
			</ThemeProvider>
		</>
	);
};

export default Sidebar;
