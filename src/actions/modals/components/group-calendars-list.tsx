/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { GroupCalendarsListItem } from './group-calendars-list-item';
import { GroupCalendar } from '../../../types/groups';

export type GroupCalendarsListProps = {
	calendars: Array<GroupCalendar>;
	onCalendarRemove: (calendarId: string) => void;
};

export const GroupCalendarsList = ({
	calendars,
	onCalendarRemove
}: GroupCalendarsListProps): React.JSX.Element => {
	const [t] = useTranslation();

	const placeholderText = t(
		'label.empty_group_calendars_list',
		'There are no calendars in this group yet.'
	);

	return (
		<Container
			gap="0.5rem"
			style={{ overflowY: 'auto' }}
			crossAlignment="flex-start"
			mainAlignment="flex-start"
		>
			{calendars.length ? (
				calendars.map((calendar) => (
					<GroupCalendarsListItem
						key={calendar.id}
						calendar={calendar}
						onRemove={onCalendarRemove}
					/>
				))
			) : (
				<Text color="gray1" overflow="break-word" size="extrasmall">
					{placeholderText}
				</Text>
			)}
		</Container>
	);
};
