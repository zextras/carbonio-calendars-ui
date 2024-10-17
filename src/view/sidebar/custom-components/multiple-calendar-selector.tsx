/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useState } from 'react';

import { ChipInput, ChipItem } from '@zextras/carbonio-design-system';
import { filter, map, reject, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ROOT_NAME } from '../../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { useFoldersMap } from '../../../carbonio-ui-commons/store/zustand/folder';
import { isTrashOrNestedInIt } from '../../../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder, LinkFolder } from '../../../carbonio-ui-commons/types';
import { hasId } from '../../../carbonio-ui-commons/worker/handle-message';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';
import { ItemFactory } from '../../editor/parts/select-label-factory';

type ChipInputItems = ChipItem<{ id: string; label: string }>[];

export type MultiCalendarSelectorProps = {
	onCalendarChange: (selectedCalendars: Array<Folder>) => void;
	excludeTrash?: boolean;
	disabled?: boolean;
};

export const MultiCalendarSelector = ({
	onCalendarChange,
	excludeTrash = false,
	disabled
}: MultiCalendarSelectorProps): ReactElement | null => {
	const [t] = useTranslation();
	const [selectedCalendarsChips, setSelectedCalendarsChips] = useState<ChipInputItems>([]);

	const allCalendars = useFoldersMap();

	const calendars = reject(
		allCalendars,
		(item) => item.name === ROOT_NAME || (item as LinkFolder).oname === ROOT_NAME
	);

	const requiredCalendars = useMemo(
		() => (excludeTrash ? filter(calendars, (cal) => !isTrashOrNestedInIt(cal)) : calendars),
		[calendars, excludeTrash]
	);

	const calendarItems = useMemo(
		() =>
			map(requiredCalendars, (cal) => {
				const color = setCalendarColor({ color: cal.color, rgb: cal.rgb });
				const labelName = hasId(cal, FOLDERS.CALENDAR) ? t('label.calendar', 'Calendar') : cal.name;
				return {
					id: cal.id,
					label: labelName,
					value: { id: cal.id, label: labelName },
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

	const onSelectedCalendarsChange = useCallback((selected: ChipInputItems) => {
		const selectedChips = uniqBy(selected, 'id');
		setSelectedCalendarsChips(selectedChips);
	}, []);

	const onIconAction = useCallback(
		(ev) => {
			ev?.stopPropagation();

			const selectedCalendars = selectedCalendarsChips.reduce((acc, { id }) => {
				const calendar = calendars.find((cal) => cal.id === id);
				if (calendar) {
					acc.push(calendar);
				}
				return acc;
			}, [] as Array<Folder>);

			onCalendarChange(selectedCalendars);
			setSelectedCalendarsChips([]);
		},
		[calendars, onCalendarChange, selectedCalendarsChips]
	);

	return (
		<ChipInput
			data-testid={'calendar-selector-input'}
			options={calendarItems}
			disableOptions={false}
			value={selectedCalendarsChips}
			onChange={onSelectedCalendarsChange}
			placeholder={t('label.calendar_selector.placeholder', 'Add Calendars')}
			requireUniqueChips
			icon={'Plus'}
			iconAction={onIconAction}
		/>
	);
};
