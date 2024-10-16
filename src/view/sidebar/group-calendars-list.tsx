/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { GroupCalendarsListItem } from './group-calendars-list-item';
import { Calendar } from '../../types/store/calendars';

export type GroupCalendarsListProps = {
	calendars: Array<Pick<Calendar, 'id' | 'name' | 'color'>>;
	onCalendarRemove: (calendarId: string) => void;
};

export const GroupCalendarsList = ({
	calendars,
	onCalendarRemove
}: GroupCalendarsListProps): React.JSX.Element => {
	const [t] = useTranslation();

	const placeholderText = t(
		'label.group_empty_calendars_list',
		'There are no calendars in this group yet. Start typing the calendars in the input, then click “+” to add them to the group.'
	);

	return (
		<Container>
			{calendars.length ? (
				calendars.map((calendar) => (
					<GroupCalendarsListItem
						key={calendar.id}
						calendar={calendar}
						onRemove={onCalendarRemove}
					/>
				))
			) : (
				<Text color="gray1">{placeholderText}</Text>
			)}
		</Container>
	);
};
