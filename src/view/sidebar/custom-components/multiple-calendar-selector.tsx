/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, ReactEventHandler, useCallback, useMemo, useState } from 'react';

import { Chip, ChipInput, ChipItem, ChipProps } from '@zextras/carbonio-design-system';
import { useFolder } from '@zextras/carbonio-shell-ui';
import { filter, map, reject, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { ROOT_NAME, ZIMBRA_STANDARD_COLORS } from '../../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { useFoldersMap } from '../../../carbonio-ui-commons/store/zustand/folder';
import { isTrashOrNestedInIt } from '../../../carbonio-ui-commons/store/zustand/folder/utils';
import { Folder, LinkFolder } from '../../../carbonio-ui-commons/types';
import { hasId } from '../../../carbonio-ui-commons/worker/handle-message';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';
import { ItemFactory } from '../../editor/parts/select-label-factory';

type CalendarChipInputItem = ChipItem<{
	id: string;
	label: string;
	onCalendarRemove: (calendarId: string) => void;
}>;

type CalendarChipInputItems = Array<CalendarChipInputItem>;

const CalendarChip: FC<CalendarChipInputItem> = ({ value }) => {
	const calendar = useFolder(value?.id ?? '');

	const label = calendar?.name ?? '';
	const avatarColor = ZIMBRA_STANDARD_COLORS[calendar?.color ?? 0].hex;

	const onChipClose = useCallback<NonNullable<ChipProps['onClose']>>(
		(e): void => {
			e.stopPropagation();
			if (!value?.id) {
				return;
			}

			value?.onCalendarRemove && value.onCalendarRemove(value?.id);
		},
		[value]
	);

	return calendar && avatarColor ? (
		<Chip
			key={value?.id}
			label={label}
			avatarColor={avatarColor}
			avatarIcon={'Square2'}
			avatarBackground="transparent"
			size={'small'}
			onClose={onChipClose}
		/>
	) : null;
};

export type MultiCalendarSelectorProps = {
	onCalendarChange: (selectedCalendars: Array<Folder>) => void;
	excludeTrash?: boolean;
	disabled?: boolean;
};

const isCalendarItem = (value: unknown): value is { id: string; label: string } =>
	!!value && typeof value === 'object' && 'id' in value && 'label' in value;

export const MultiCalendarSelector = ({
	onCalendarChange,
	excludeTrash = false,
	disabled
}: MultiCalendarSelectorProps): ReactElement | null => {
	const [t] = useTranslation();
	const [selectedCalendarsChips, setSelectedCalendarsChips] = useState<CalendarChipInputItems>([]);

	const allCalendars = useFoldersMap();

	const calendars = reject(
		allCalendars,
		(item) => item.name === ROOT_NAME || (item as LinkFolder).oname === ROOT_NAME
	);

	const requiredCalendars = useMemo(
		() => (excludeTrash ? filter(calendars, (cal) => !isTrashOrNestedInIt(cal)) : calendars),
		[calendars, excludeTrash]
	);

	const calendarOptions = useMemo(
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

	const removeSelectedCalendarChip = useCallback(
		(id: string): void => {
			const remainingSelectedCalendarsChips = selectedCalendarsChips.filter(
				(chip) => chip.value?.id !== id
			);
			setSelectedCalendarsChips(remainingSelectedCalendarsChips);
		},
		[selectedCalendarsChips]
	);

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
