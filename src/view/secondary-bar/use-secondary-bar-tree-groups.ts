/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AccordionItemType } from '@zextras/carbonio-design-system';
import { compact, find, map, reject, sortBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { SIDEBAR_ITEMS } from '../../constants/sidebar';
import { useCalendarGroups } from '../../store/zustand/calendar-group-store';
import { GroupAccordionItem } from './custom-accordion-components/group-accordion-item';

export const useSecondaryBarTreeGroups = (): Array<AccordionItemType> => {
	const [t] = useTranslation();
	const groups = useCalendarGroups();

	const allCalendars = find(groups, ['id', SIDEBAR_ITEMS.ALL_CALENDAR]);
	const otherGroups = reject(groups, ['id', SIDEBAR_ITEMS.ALL_CALENDAR]);
	const sortedGroups = compact([
		allCalendars,
		...sortBy(otherGroups, (group) => group.name.toLowerCase())
	]);

	return map(sortedGroups, (group) => {
		const label =
			group.id === SIDEBAR_ITEMS.ALL_CALENDAR
				? t('label.all_calendars', 'All calendars')
				: group.name;

		return {
			id: group.id,
			label,
			CustomComponent: GroupAccordionItem
		};
	});
};
