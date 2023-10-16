/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Container, Padding, Select, SelectItem, Text } from '@zextras/carbonio-design-system';
import { FOLDERS, LinkFolder, ROOT_NAME, t, useUserSettings } from '@zextras/carbonio-shell-ui';
import { filter, find, map, reject } from 'lodash';

import LabelFactory, { Square } from './select-label-factory';
import { useFoldersArray } from '../../../carbonio-ui-commons/store/zustand/folder';
import { isTrashOrNestedInIt } from '../../../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { hasId } from '../../../carbonio-ui-commons/worker/handle-message';
import { PREFS_DEFAULTS } from '../../../constants';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';

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
	const allCalendars = useFoldersArray();
	const calendars = reject(
		allCalendars,
		(item) => item.name === ROOT_NAME || (item as LinkFolder).oname === ROOT_NAME
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
				? filter(calWithWritePerm, (cal) => !isTrashOrNestedInIt(cal))
				: calWithWritePerm,
		[calWithWritePerm, excludeTrash]
	);
	const calendarItems = useMemo(
		() =>
			map(requiredCalendars, (cal) => {
				const color = setCalendarColor({ color: cal.color, rgb: cal.rgb });
				const labelName = hasId(cal, FOLDERS.CALENDAR) ? t('label.calendar', 'Calendar') : cal.name;
				return {
					label: labelName,
					value: cal.id,
					color: color.color || 0,
					customComponent: (
						<Container width="fit" mainAlignment="flex-start" orientation="horizontal">
							<Square color={color.color || 'gray6'} />
							<Padding left="small">
								<Text>{labelName}</Text>
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
