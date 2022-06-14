/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Select, Text } from '@zextras/carbonio-design-system';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { filter, find, map } from 'lodash';
import { selectCalendarsArray } from '../../../store/selectors/calendars';
import { Calendar } from '../../../types/store/calendars';
import LabelFactory, { Square } from './select-label-factory';

type CalendarSelectorProps = {
	calendarId: string;
	onCalendarChange: (calendar: Calendar) => void;
	label?: string;
	excludeTrash?: boolean;
	updateAppTime?: boolean;
	showCalWithWritePerm?: boolean;
	disabled?: boolean;
};

export const CalendarSelector = ({
	calendarId,
	onCalendarChange,
	label,
	excludeTrash = false,
	updateAppTime = false,
	showCalWithWritePerm = true,
	disabled
}: CalendarSelectorProps): JSX.Element => {
	const [t] = useTranslation();

	const calendars = useSelector(selectCalendarsArray);
	const calWithWritePerm = useMemo(
		() => (showCalWithWritePerm ? filter(calendars, 'haveWriteAccess') : calendars),
		[calendars, showCalWithWritePerm]
	);

	const requiredCalendars = useMemo(
		() => (excludeTrash ? filter(calWithWritePerm, (cal) => cal.zid !== '3') : calWithWritePerm),
		[calWithWritePerm, excludeTrash]
	);
	const calendarItems = useMemo(
		() =>
			map(requiredCalendars, (cal) => ({
				label: cal.name,
				value: cal.id,
				color: cal.color.color || 0,
				customComponent: (
					<Container width="fit" mainAlignment="flex-start" orientation="horizontal">
						<Square color={cal.color.color || 'gray6'} />
						<Padding left="small">
							<Text>{cal.name}</Text>
						</Padding>
					</Container>
				)
			})),
		[requiredCalendars]
	);
	const defaultCalendarSelection = useMemo(
		() => find(calendarItems, ['value', calendarId]) || requiredCalendars[0],
		[calendarItems, requiredCalendars, calendarId]
	);

	const getSelectedCalendar = useCallback(
		(id) => find(calendars, ['id', id]) ?? calendars[10],
		[calendars]
	);

	const onSelectedCalendarChange = useCallback(
		(id) => onCalendarChange(getSelectedCalendar(id)),
		[getSelectedCalendar, onCalendarChange]
	);

	return (
		<Select
			label={label || t('label.calendar', 'Calendar')}
			onChange={onSelectedCalendarChange}
			items={calendarItems}
			defaultSelection={defaultCalendarSelection}
			disablePortal
			disabled={updateAppTime || disabled}
			LabelFactory={LabelFactory}
		/>
	);
};
