/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Padding, Select, SelectItem, Text } from '@zextras/carbonio-design-system';
import { FOLDERS, LinkFolder, t, useUserSettings } from '@zextras/carbonio-shell-ui';
import React, { ReactElement, useCallback, useMemo } from 'react';
import { filter, find, map, reject } from 'lodash';
import { getFoldersArrayByRoot } from '../../../carbonio-ui-commons/store/zustand/folder';
import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { PREFS_DEFAULTS } from '../../../constants';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';
import LabelFactory, { Square } from './select-label-factory';

type CalendarSelectorProps = {
	calendarId: string;
	onCalendarChange: (calendar: Folder) => void;
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
	// todo: This selector is ignoring shared accounts. Replace with useFoldersArray once shared accounts will be available.
	// REFS: IRIS-2589
	const allCalendars = getFoldersArrayByRoot(FOLDERS.USER_ROOT);
	const calendars = reject(
		allCalendars,
		(item) => item.name === 'USER_ROOT' || (item as LinkFolder).oname === 'USER_ROOT'
	);
	const { zimbraPrefDefaultCalendarId } = useUserSettings().prefs;
	const calWithWritePerm = useMemo(
		() =>
			showCalWithWritePerm
				? filter(calendars, (calendar) =>
						calendar.perm ? /w/.test(calendar.perm) : !(calendar as LinkFolder).owner
				  )
				: calendars,
		[calendars, showCalWithWritePerm]
	);

	const requiredCalendars = useMemo(
		() =>
			excludeTrash
				? filter(
						calWithWritePerm,
						(cal) => cal.id !== FOLDERS.TRASH && !cal.absFolderPath?.includes('/Trash')
				  )
				: calWithWritePerm,
		[calWithWritePerm, excludeTrash]
	);
	const calendarItems = useMemo(
		() =>
			map(requiredCalendars, (cal) => {
				const color = setCalendarColor({ color: cal.color, rgb: cal.rgb });
				return {
					label: cal.id === FOLDERS.CALENDAR ? t('label.calendar', 'Calendar') : cal.name,
					value: cal.id,
					color: color.color || 0,
					customComponent: (
						<Container width="fit" mainAlignment="flex-start" orientation="horizontal">
							<Square color={color.color || 'gray6'} />
							<Padding left="small">
								<Text>
									{cal.id === FOLDERS.CALENDAR ? t('label.calendar', 'Calendar') : cal.name}
								</Text>
							</Padding>
						</Container>
					)
				} as SelectItem;
			}),
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
