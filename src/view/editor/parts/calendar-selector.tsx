/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Select } from '@zextras/carbonio-design-system';
import {
	FOLDERS,
	LinkFolder,
	ROOT_NAME,
	t,
	useRoot,
	useUserSettings
} from '@zextras/carbonio-shell-ui';
import { filter, find, map, reject } from 'lodash';

import LabelFactory, { ItemFactory } from './select-label-factory';
import {
	getRootAccountId,
	useFoldersArray,
	useFoldersArrayByRoot
} from '../../../carbonio-ui-commons/store/zustand/folder';
import { isTrashOrNestedInIt } from '../../../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder } from '../../../carbonio-ui-commons/types/folder';
import { hasId } from '../../../carbonio-ui-commons/worker/handle-message';
import { PREFS_DEFAULTS } from '../../../constants';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';
import store from '../../../test/generators/store';

type CalendarSelectorProps = {
	calendarId: string;
	onCalendarChange: (calendar: Folder) => void;
	label?: string;
	excludeTrash?: boolean;
	showCalWithWritePerm?: boolean;
	disabled?: boolean;
};

export const CalendarSelector = ({
	calendarId,
	onCalendarChange,
	label,
	excludeTrash = false,
	showCalWithWritePerm = true,
	disabled
}: CalendarSelectorProps): ReactElement | null => {
	const rootAccountId = getRootAccountId(calendarId);

	const allCalendarsByRoot = useFoldersArrayByRoot(rootAccountId ?? FOLDERS.USER_ROOT);
	const allCalendars = useFoldersArray();

	const calendars = reject(
		rootAccountId?.includes(':') ? allCalendarsByRoot : allCalendars,
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
					...cal,
					label: labelName,
					value: cal.id,
					color: color.color,
					customComponent: (
						<ItemFactory
							disabled={disabled ?? false}
							absFolderPath={cal.absFolderPath}
							color={color.color}
							isLink={cal.isLink}
							label={labelName}
							acl={cal.acl}
							id={cal.id}
						/>
					)
				};
			}),
		[disabled, requiredCalendars]
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
			maxWidth={'fill'}
			defaultSelection={defaultCalendarSelection}
			disablePortal
			disabled={disabled}
			LabelFactory={LabelFactory}
		/>
	) : null;
};
