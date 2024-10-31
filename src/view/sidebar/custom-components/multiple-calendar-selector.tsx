/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, ReactEventHandler, useCallback, useMemo, useState } from 'react';

import { ChipInput } from '@zextras/carbonio-design-system';
import { map, reject, sortBy, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CalendarChip, CalendarChipInputItem, CalendarChipInputItems } from './calendar-chips';
import { ROOT_NAME } from '../../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { isLink, isTrash } from '../../../carbonio-ui-commons/helpers/folders';
import { useFoldersMap } from '../../../carbonio-ui-commons/store/zustand/folder';
import { Folder, LinkFolder } from '../../../carbonio-ui-commons/types';
import { hasId } from '../../../carbonio-ui-commons/worker/handle-message';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';
import { ItemFactory } from '../../editor/parts/select-label-factory';

export type MultipleCalendarSelectorProps = {
	onCalendarChange: (selectedCalendars: Array<Folder>) => void;
};

const isCalendarItem = (value: unknown): value is { id: string; label: string } =>
	!!value && typeof value === 'object' && 'id' in value && 'label' in value;

const sortCriteria = (folder: Folder): string => {
	if (isLink(folder)) {
		return `3000-${folder.name.toLowerCase()}`;
	}

	if (folder.id === FOLDERS.CALENDAR) {
		return '1000';
	}
	return `2000-${folder.name.toLowerCase()}`;
};

export const MultipleCalendarSelector = ({
	onCalendarChange
}: MultipleCalendarSelectorProps): ReactElement | null => {
	const [t] = useTranslation();
	const [selectedCalendarsChips, setSelectedCalendarsChips] = useState<CalendarChipInputItems>([]);

	const allCalendars = useFoldersMap();

	const calendars = reject(
		allCalendars,
		(item) =>
			item.name === ROOT_NAME || (item as LinkFolder).oname === ROOT_NAME || isTrash(item.id)
	);

	const calendarOptions = useMemo(() => {
		const sortedCalendars = sortBy(calendars, sortCriteria);
		return map(sortedCalendars, (cal) => {
			const color = setCalendarColor({ color: cal.color, rgb: cal.rgb });
			const labelName = hasId(cal, FOLDERS.CALENDAR) ? t('label.calendar', 'Calendar') : cal.name;
			return {
				id: cal.id,
				label: labelName,
				value: { id: cal.id, label: labelName },
				color: color.color,
				customComponent: (
					<ItemFactory
						disabled={false}
						absFolderPath={cal.absFolderPath}
						color={color.color}
						isLink={cal.isLink}
						label={labelName}
						acl={cal.acl}
						id={cal.id}
					/>
				)
			};
		});
	}, [calendars, t]);

	const removeSelectedCalendarChip = useCallback((id: string): void => {
		setSelectedCalendarsChips((existingChips) =>
			existingChips.filter((chip) => chip.value?.id !== id)
		);
	}, []);

	const onSelectedCalendarsAdd = useCallback(
		(value: unknown): CalendarChipInputItem => {
			if (!isCalendarItem(value)) {
				return { label: '' };
			}

			return {
				label: value.label,
				value: {
					id: value.id,
					label: value.label,
					onCalendarRemove: () => removeSelectedCalendarChip(value.id)
				}
			};
		},
		[removeSelectedCalendarChip]
	);

	const onSelectedCalendarsChange = useCallback((selected: CalendarChipInputItems) => {
		const selectedChips = uniqBy(selected, (chip) => chip.value?.id);
		setSelectedCalendarsChips(selectedChips);
	}, []);

	const onIconAction = useCallback<ReactEventHandler>(
		(ev) => {
			ev?.stopPropagation();

			const selectedCalendars = selectedCalendarsChips.reduce((acc, chipItem) => {
				const calendar = calendars.find((cal) => cal.id === chipItem.value?.id);
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
			options={calendarOptions}
			disableOptions={false}
			value={selectedCalendarsChips}
			onAdd={onSelectedCalendarsAdd}
			onChange={onSelectedCalendarsChange}
			placeholder={t('label.calendar_selector.placeholder', 'Add Calendars')}
			requireUniqueChips
			icon={'Plus'}
			iconAction={onIconAction}
			ChipComponent={CalendarChip}
		/>
	);
};
