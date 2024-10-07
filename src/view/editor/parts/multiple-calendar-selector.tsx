/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo } from 'react';

import { Select, SelectItem } from '@zextras/carbonio-design-system';
import { LinkFolder } from '@zextras/carbonio-shell-ui';
import { filter, map, reject } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ItemFactory } from './select-label-factory';
import { ROOT_NAME } from '../../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import {
	getRootAccountId,
	useFoldersMap,
	useFoldersMapByRoot
} from '../../../carbonio-ui-commons/store/zustand/folder';
import { isTrashOrNestedInIt } from '../../../carbonio-ui-commons/store/zustand/folder/utils';
import { hasId } from '../../../carbonio-ui-commons/worker/handle-message';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';

type MultiCalendarSelectorProps = {
	calendarIds: string[];
	onCalendarChange: (selectedCalendars: string[]) => void;
	label?: string;
	showCalWithWritePerm?: boolean;
	excludeTrash?: boolean;
	disabled?: boolean;
};

export const MultiCalendarSelector = ({
	calendarIds,
	onCalendarChange,
	label,
	showCalWithWritePerm = true,
	excludeTrash = false,
	disabled
}: MultiCalendarSelectorProps): ReactElement | null => {
	const [t] = useTranslation();
	const rootAccountId = getRootAccountId(calendarIds[0]);

	const allCalendarsByRoot = useFoldersMapByRoot(rootAccountId ?? FOLDERS.USER_ROOT);
	const allCalendars = useFoldersMap();

	const calendars = reject(
		rootAccountId?.includes(':') ? allCalendarsByRoot : allCalendars,
		(item) => item.name === ROOT_NAME || (item as LinkFolder).oname === ROOT_NAME
	);

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
		[disabled, requiredCalendars, t]
	);

	const selectedItems: SelectItem[] = useMemo(
		() =>
			calendarIds.map((id) => ({
				label: calendarItems.find((item) => item.value === id)?.label || id,
				value: id
			})),
		[calendarIds, calendarItems]
	);

	const onSelectedCalendarsChange = useCallback(
		(selectedValues: SelectItem<string>[]) => {
			const selectedIds = selectedValues.map((item) => item.value);
			onCalendarChange(selectedIds);
		},
		[onCalendarChange]
	);

	return (
		<Select
			itemIconSize={'medium'}
			label={label || t('label.calendar', 'Calendar')}
			onChange={onSelectedCalendarsChange}
			items={calendarItems}
			maxWidth={'fill'}
			multiple
			selection={selectedItems}
			disabled={disabled}
			disablePortal
			showCheckbox
		/>
	);
};
