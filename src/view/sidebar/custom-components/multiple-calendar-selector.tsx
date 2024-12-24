/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	ReactElement,
	ReactEventHandler,
	useCallback,
	useMemo,
	useRef,
	useState
} from 'react';

import { ChipInput, ChipInputProps, DropdownItem } from '@zextras/carbonio-design-system';
import { differenceWith, map, reject, sortBy, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { CalendarChip, CalendarChipInputItem, CalendarChipInputItems } from './calendar-chips';
import { ROOT_NAME } from '../../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { isLink, isTrashed } from '../../../carbonio-ui-commons/helpers/folders';
import { useFoldersMap } from '../../../carbonio-ui-commons/store/zustand/folder';
import { Folder, LinkFolder } from '../../../carbonio-ui-commons/types';
import { hasId } from '../../../carbonio-ui-commons/worker/handle-message';
import { setCalendarColor } from '../../../normalizations/normalizations-utils';
import { ItemFactory } from '../../editor/parts/select-label-factory';

export type MultipleCalendarSelectorProps = {
	onCalendarChange: (selectedCalendars: Array<Folder>) => void;
	excludedCalendarsIds?: Array<string>;
};

type ChipInputOptions = Array<
	DropdownItem & { value?: { id: string; label: string; isLink: boolean } }
>;
const CHIP_INPUT_SEPARATORS = ['Enter', ','];

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
	onCalendarChange,
	excludedCalendarsIds
}: MultipleCalendarSelectorProps): ReactElement | null => {
	const [t] = useTranslation();
	const [selectedCalendarsIds, setSelectedCalendarsIds] = useState<Array<string>>([]);
	const folders = useFoldersMap();
	const [options, setOptions] = useState<ChipInputOptions>();
	const inputRef = useRef<HTMLInputElement>(null);

	const eligibleSortedCalendars = useMemo(() => {
		const filteredFolders = reject(
			folders,
			(item) =>
				item.name === ROOT_NAME ||
				(item as LinkFolder).oname === ROOT_NAME ||
				isTrashed({ folderId: item.id }) ||
				(excludedCalendarsIds !== undefined && excludedCalendarsIds.includes(item.id))
		);

		return sortBy(filteredFolders, sortCriteria);
	}, [excludedCalendarsIds, folders]);

	const selectedCalendars = useMemo(
		() =>
			selectedCalendarsIds.reduce((acc, id) => {
				const calendar = eligibleSortedCalendars.find((cal) => cal.id === id);
				if (calendar) {
					acc.push(calendar);
				}
				return acc;
			}, [] as Array<Folder>),
		[eligibleSortedCalendars, selectedCalendarsIds]
	);

	const removeSelectedCalendarId = useCallback((id: string): void => {
		setSelectedCalendarsIds((selectedIds) => selectedIds.filter((selectedId) => selectedId !== id));
	}, []);

	const createChip = useCallback(
		({ label, id }: { label: string; id: string }) => ({
			label,
			value: {
				id,
				label,
				onCalendarRemove: (calendarId: string) => removeSelectedCalendarId(calendarId)
			}
		}),
		[removeSelectedCalendarId]
	);

	const selectedCalendarsChips = useMemo(
		() => selectedCalendars.map((cal) => createChip({ label: cal.name, id: cal.id })),
		[createChip, selectedCalendars]
	);

	const isCalendarAddDisabled = selectedCalendarsChips.length === 0;

	const createOptions = useCallback(
		({
			namePrefix = '',
			excludedIds = []
		}: {
			namePrefix?: string;
			excludedIds?: Array<string>;
		} = {}): ChipInputOptions => {
			// Filter eligible calendars by excluding the calendars with ids in excludedIds
			const includedCalendars = differenceWith(
				eligibleSortedCalendars,
				excludedIds,
				(val1, val2) => val1?.id === val2
			);

			// Filter again by name starting with namePrefix
			const filteredByName = includedCalendars.filter((calendar) =>
				calendar.name.toLowerCase().includes(namePrefix.toLowerCase())
			);

			// If there are no calendars, return a single option with a message 'no options available'
			if (filteredByName.length === 0) {
				return [
					{
						id: 'no_options',
						label: 'no options available',
						disabled: true
					}
				];
			}

			// Create options with the result of the previous steps
			return map(filteredByName, (cal) => {
				const color = setCalendarColor({ color: cal.color, rgb: cal.rgb });
				const labelName = hasId(cal, FOLDERS.CALENDAR) ? t('label.calendar', 'Calendar') : cal.name;
				return {
					id: cal.id,
					label: labelName,
					value: { id: cal.id, label: labelName, isLink: cal.isLink },
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
		},
		[eligibleSortedCalendars, t]
	);

	const onSelectedCalendarsAdd = useCallback(
		(value: unknown): CalendarChipInputItem => {
			if (!isCalendarItem(value)) {
				return { label: '' };
			}

			return createChip(value);
		},
		[createChip]
	);

	const getNamePrefix = useCallback(() => inputRef.current?.value ?? '', []);

	const onSelectedCalendarsChange = useCallback((selected: CalendarChipInputItems) => {
		const selectedChips = uniqBy(selected, (chip) => chip.value?.id);
		const updatedSelectedIds = selectedChips.map((chip) => chip.value?.id ?? '');
		setSelectedCalendarsIds(updatedSelectedIds);
	}, []);

	const onCalendarsAdd = useCallback(
		(ev: KeyboardEvent | React.SyntheticEvent) => {
			ev?.stopPropagation();
			onCalendarChange(selectedCalendars);
			setSelectedCalendarsIds([]);
			setOptions([]);
		},
		[onCalendarChange, selectedCalendars]
	);

	const onInputType = useCallback<NonNullable<ChipInputProps['onInputType']>>(
		({ key, textContent }) => {
			if (CHIP_INPUT_SEPARATORS.includes(key)) {
				setOptions(createOptions());

				if (!options?.[0] || !options[0].value) {
					return;
				}

				if (selectedCalendarsIds.includes(options[0].value.id)) {
					return;
				}

				const updatedSelectedCalendarsIds = [...selectedCalendarsIds, options[0].value.id];
				setSelectedCalendarsIds(updatedSelectedCalendarsIds);
			} else {
				setOptions(createOptions({ namePrefix: textContent ?? '' }));
			}
		},
		[createOptions, options, selectedCalendarsIds]
	);

	const onFocus = useCallback(() => {
		setOptions(createOptions({ namePrefix: getNamePrefix() }));
	}, [createOptions, getNamePrefix]);

	return (
		<ChipInput
			data-testid={'calendar-selector-input'}
			options={options}
			disableOptions
			value={selectedCalendarsChips}
			onAdd={onSelectedCalendarsAdd}
			inputRef={inputRef}
			onInputTypeDebounce={0}
			onInputType={onInputType}
			onChange={onSelectedCalendarsChange}
			placeholder={t('label.calendar_selector.placeholder', 'Add Calendars')}
			separators={CHIP_INPUT_SEPARATORS.map((key) => ({ key, ctrlKey: false }))}
			requireUniqueChips
			icon={'Plus'}
			iconDisabled={isCalendarAddDisabled}
			iconAction={onCalendarsAdd}
			ChipComponent={CalendarChip}
			onFocus={onFocus}
		/>
	);
};
