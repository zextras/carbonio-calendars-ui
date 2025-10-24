/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback, useMemo } from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';
import { Folder, useRoot } from '@zextras/carbonio-ui-commons';
import { map, sortBy } from 'lodash';

import { getCalendarSortCriteria } from './calendar-sort-criteria';
import { CalendarAccordionItem } from './custom-accordion-components/calendar-accordion-item';
import { useAccordionItemOpenStatusStorage } from './use-accordion-item-open-status-storage';

export const useSecondaryBarTreeCalendars = (rootId: string): Array<AccordionItemType> => {
	const { isOpen, setOpenStatus } = useAccordionItemOpenStatusStorage();

	const root = useRoot(rootId);

	// Get all the calendars under the specified root
	const calendars = useMemo(() => root?.children ?? [], [root]);

	// Filter out broken links
	const validCalendars = useMemo(
		() => calendars.filter((calendar) => !(calendar.isLink && calendar.broken)),
		[calendars]
	);

	// Sort calendars
	const sortedCalendars = useMemo(
		() => sortBy(validCalendars, getCalendarSortCriteria),
		[validCalendars]
	);

	const onCalendarOpen = useCallback(
		(calendarId: string): AccordionItemType['onOpen'] =>
			() =>
				setOpenStatus(calendarId, true),
		[setOpenStatus]
	);

	const onCalendarClose = useCallback(
		(calendarId: string): AccordionItemType['onClose'] =>
			() =>
				setOpenStatus(calendarId, false),
		[setOpenStatus]
	);

	/*
	 * Create a callback to generate a single calendar item
	 * and if the calendar contains sub-calendars, they will be
	 * generated recursively
	 */
	const createCalendarItem = useCallback(
		(calendar: Folder): AccordionItemType =>
			({
				id: calendar.id,
				open: isOpen(calendar.id),
				onOpen: onCalendarOpen(calendar.id),
				onClose: onCalendarClose(calendar.id),
				CustomComponent: CalendarAccordionItem,
				items: map(calendar.children, (subCalendar) => createCalendarItem(subCalendar))
			}) satisfies AccordionItemType,
		[isOpen, onCalendarClose, onCalendarOpen]
	);

	// Generate and return calendar items
	return useMemo(
		() => map(sortedCalendars, (calendar) => createCalendarItem(calendar)),
		[createCalendarItem, sortedCalendars]
	);
};
