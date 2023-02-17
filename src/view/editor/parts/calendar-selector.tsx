/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Select, SelectItem, Text } from '@zextras/carbonio-design-system';
import { FOLDERS, t, useUserSettings } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { filter, find, map } from 'lodash';
import { PREFS_DEFAULTS } from '../../../constants';
import { useAppSelector } from '../../../store/redux/hooks';
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
}: CalendarSelectorProps): ReactElement | null => {
	const calendars = useAppSelector(selectCalendarsArray);
	const { zimbraPrefDefaultCalendarId } = useUserSettings().prefs;
	const calWithWritePerm = useMemo(
		() => (showCalWithWritePerm ? filter(calendars, 'haveWriteAccess') : calendars),
		[calendars, showCalWithWritePerm]
	);

	const requiredCalendars = useMemo(
		() =>
			excludeTrash ? filter(calWithWritePerm, (cal) => cal.id !== FOLDERS.TRASH) : calWithWritePerm,
		[calWithWritePerm, excludeTrash]
	);
	const calendarItems = useMemo(
		() =>
			map(
				requiredCalendars,
				(cal) =>
					({
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
					} as SelectItem)
			),
		[requiredCalendars]
	);

	const defaultCalendarSelection = useMemo(() => {
		const defaultCal = find(requiredCalendars, [
			'id',
			zimbraPrefDefaultCalendarId ?? PREFS_DEFAULTS?.DEFAULT_CALENDAR_ID
		]);
		const defaultCalendar = {
			value: defaultCal?.id ?? requiredCalendars?.[0]?.id,
			label: defaultCal?.name ?? requiredCalendars?.[0]?.name,
			color: defaultCal?.color ?? requiredCalendars?.[0]?.color
		};
		return find(calendarItems, ['value', calendarId]) ?? defaultCalendar;
	}, [requiredCalendars, zimbraPrefDefaultCalendarId, calendarItems, calendarId]);

	const onSelectedCalendarChange = useCallback(
		(id) => {
			const calendar = find(calendars, ['id', id]) ?? requiredCalendars[0];
			return onCalendarChange(calendar);
		},
		[calendars, onCalendarChange, requiredCalendars]
	);

	return calendars && defaultCalendarSelection ? (
		<Select
			label={label || t('label.calendar', 'Calendar')}
			onChange={onSelectedCalendarChange}
			items={calendarItems}
			defaultSelection={defaultCalendarSelection}
			disablePortal
			disabled={updateAppTime || disabled}
			LabelFactory={LabelFactory}
		/>
	) : null;
};
