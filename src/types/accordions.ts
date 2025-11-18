/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ComponentType, ReactElement } from 'react';

import { Folder } from '@zextras/carbonio-ui-commons';

import { CalendarGroup } from '../store/zustand/calendar-group-store';

export const isGroupType = (item: Folder | CalendarGroup): item is CalendarGroup =>
	'calendarId' in item;

export const isCalendarType = (item: Folder | CalendarGroup): item is Folder => !isGroupType(item);

export type Contact = {
	middleName: string;
	firstName: string;
	email: { email: { mail: string } };
	address: string;
};

export type SidebarFolder = Folder & {
	// indicates whether this folder have an icon
	noIcon?: boolean;
	// indicates whether this folder should not be expandable
	noExpandChildren?: boolean;
};

export type SidebarAccordionProps = {
	accordions: Array<SidebarFolder | CalendarGroup>;
	folderId: string;
	localStorageName: string;
	AccordionCustomComponent: ComponentType<{ item: Folder | CalendarGroup }>;
	setSelectedFolder?: (folderId: string) => void;
	buttonFindShares?: ReactElement;
	buttonCreateGroup?: ReactElement;
	initialExpanded?: string[];
};
