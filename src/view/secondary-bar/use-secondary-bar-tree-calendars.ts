/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';
import { useRoot } from '@zextras/carbonio-ui-commons';
import { map, sortBy } from 'lodash';

import { getCalendarSortCriteria } from './calendar-sort-criteria';
import { CalendarAccordionItem } from './custom-accordion-components/calendar-accordion-item';

export const useSecondaryBarTreeCalendars = (rootId: string): Array<AccordionItemType> => {
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

	// Generate and return calendar items
	return useMemo(
		() =>
			map(sortedCalendars, (calendar) => ({
				id: calendar.id,
				CustomComponent: CalendarAccordionItem
			})),
		[sortedCalendars]
	);
};
