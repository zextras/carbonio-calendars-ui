/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { AccordionItemType } from '@zextras/carbonio-design-system';
import { compact, map, reject, sortBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CreateGroupAccordionItem } from './custom-accordion-components/create-group-accordion-item';
import { GroupAccordionItem } from './custom-accordion-components/group-accordion-item';
import { SIDEBAR_ITEMS } from '../../constants/sidebar';
import { useCalendarGroups } from '../../store/zustand/calendar-group-store';

export const useSecondaryBarTreeGroups = (): Array<AccordionItemType> => {
	const [t] = useTranslation();
	const groups = useCalendarGroups();

	const allCalendars = useMemo(() => groups[SIDEBAR_ITEMS.ALL_CALENDAR], [groups]);
	const otherGroups = useMemo(() => reject(groups, ['id', SIDEBAR_ITEMS.ALL_CALENDAR]), [groups]);
	const sortedGroups = useMemo(
		() => compact([allCalendars, ...sortBy(otherGroups, (group) => group.name.toLowerCase())]),
		[allCalendars, otherGroups]
	);

	return useMemo(() => {
		const groupsItems = map(sortedGroups, (group) => {
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

		const createGroupItem: AccordionItemType = {
			id: 'add-group',
			disableHover: true,
			CustomComponent: CreateGroupAccordionItem
		};

		return [...groupsItems, createGroupItem];
	}, [sortedGroups, t]);
};
