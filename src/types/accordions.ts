/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ComponentType, ReactElement } from 'react';

import { Folder } from '../carbonio-ui-commons/types';
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

export type SidebarAccordionProps = {
	accordions: Array<Folder | CalendarGroup>;
	folderId: string;
	localStorageName: string;
	AccordionCustomComponent: ComponentType<{ item: Folder | CalendarGroup }>;
	setSelectedFolder?: (folderId: string) => void;
	buttonFindShares?: ReactElement;
	buttonCreateGroup?: ReactElement;
	initialExpanded?: string[];
};
