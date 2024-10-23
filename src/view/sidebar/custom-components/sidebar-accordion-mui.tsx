/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useRef } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Container } from '@mui/material';
import { useLocalStorage } from '@zextras/carbonio-shell-ui';

import { theme } from '../../../carbonio-ui-commons/theme/theme-mui';
import { CalendarGroup, Folder } from '../../../carbonio-ui-commons/types';
import { isCalendarType, SidebarAccordionProps } from '../../../types/accordions';

export const SidebarAccordionMui: FC<SidebarAccordionProps> = ({
	accordions,
	folderId,
	localStorageName,
	AccordionCustomComponent,
	setSelectedFolder,
	buttonFindShares,
	buttonCreateGroup,
	initialExpanded
}) => {
	const [openIds, setOpenIds] = useLocalStorage<Array<string>>(
		localStorageName,
		initialExpanded ?? []
	);
	const sidebarRef = useRef<HTMLInputElement>(null);
	const onClick = useCallback(
		({ accordion, expanded }: { accordion: Folder | CalendarGroup; expanded: boolean }): void => {
			if (expanded) {
				setOpenIds((state: Array<string>) =>
					state.includes(accordion.id) ? state : [...state, accordion.id]
				);
			} else {
				setOpenIds((state: Array<string>) => state.filter((id) => id !== accordion.id));
			}
		},
		[setOpenIds]
	);

	const customComponents: { [key: string]: any } = {
		create_group: buttonCreateGroup,
		find_shares: buttonFindShares
	};

	return (
		<Container ref={sidebarRef} disableGutters>
			{accordions.map(
				(accordion) =>
					customComponents[accordion.id] || (
						<Accordion
							disableGutters
							slotProps={{ transition: { unmountOnExit: true } }}
							expanded={openIds.includes(accordion.id)}
							key={accordion.id}
						>
							<AccordionSummary
								onClick={(): void => {
									setSelectedFolder && setSelectedFolder(accordion.id);
								}}
								expandIcon={
									isCalendarType(accordion) &&
									accordion?.children?.length > 0 &&
									!accordion.noExpandChildren && (
										<ExpandMoreIcon
											color="primary"
											onClick={(e): void => {
												e.preventDefault();
												onClick({ accordion, expanded: !openIds.includes(accordion.id) });
											}}
										/>
									)
								}
								aria-controls="panel1a-content"
								id={accordion.id}
								sx={{
									backgroundColor:
										accordion.id === folderId
											? theme.palette.highlight.hover
											: theme.palette.gray5.regular,
									'&:hover': {
										backgroundColor:
											accordion.id === folderId
												? theme.palette.highlight.active
												: theme.palette.gray5.hover
									}
								}}
							>
								<AccordionCustomComponent item={accordion} />
							</AccordionSummary>
							{isCalendarType(accordion) && accordion?.children?.length > 0 && (
								<AccordionDetails>
									<SidebarAccordionMui
										accordions={accordion.children}
										folderId={folderId}
										key={accordion.id}
										localStorageName={localStorageName}
										AccordionCustomComponent={AccordionCustomComponent}
										setSelectedFolder={setSelectedFolder}
										buttonFindShares={buttonFindShares}
										buttonCreateGroup={buttonCreateGroup}
										initialExpanded={initialExpanded}
									/>
								</AccordionDetails>
							)}
						</Accordion>
					)
			)}
		</Container>
	);
};
