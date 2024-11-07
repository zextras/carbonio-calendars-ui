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

import { ChipInput, ChipInputProps } from '@zextras/carbonio-design-system';
import {
	differenceBy,
	differenceWith,
	filter,
	isNil,
	map,
	reject,
	sortBy,
	startsWith,
	uniqBy
} from 'lodash';
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
	calendarsToExclude?: Array<Folder>;
};

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

export const MultipleCalendarSelector2 = ({
	onCalendarChange,
	calendarsToExclude
}: MultipleCalendarSelectorProps): ReactElement | null => {
	const [t] = useTranslation();
	const [selectedCalendarsChips, setSelectedCalendarsChips] = useState<CalendarChipInputItems>([]);
	const [inputContent, setInputContent] = useState<string>('');
	const allCalendars = useFoldersMap();
	const [isChipInputFocused, setChipInputFocused] = useState<boolean>(false);

	const calendars = reject(
		allCalendars,
		(item) =>
			item.name === ROOT_NAME || (item as LinkFolder).oname === ROOT_NAME || isTrash(item.id)
	);

	const options = useMemo(() => {
		if (!isChipInputFocused) {
			return undefined;
		}

		const unselectedCalendars = differenceWith(
			calendars,
			selectedCalendarsChips,
			(val1, val2) => val1?.id === val2?.value?.id
		);
		const calendarsNotInGroup = differenceBy(unselectedCalendars, calendarsToExclude ?? [], 'id');
		const filteredByInput = filter(calendarsNotInGroup, (calendar) =>
			startsWith(calendar.name.toLowerCase(), inputContent.toLowerCase())
		);
		const sortedCalendarOptions = sortBy(filteredByInput, sortCriteria);

		return sortedCalendarOptions.length
			? map(sortedCalendarOptions, (cal) => {
					const color = setCalendarColor({ color: cal.color, rgb: cal.rgb });
					const labelName = hasId(cal, FOLDERS.CALENDAR)
						? t('label.calendar', 'Calendar')
						: cal.name;
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
				})
			: [{ id: 'no_options', label: 'no options available', disabled: true }];
	}, [calendars, calendarsToExclude, inputContent, isChipInputFocused, selectedCalendarsChips, t]);

	const isCalendarAddDisabled = selectedCalendarsChips.length === 0;

	const removeSelectedCalendarChip = useCallback((id: string): void => {
		setSelectedCalendarsChips((existingChips) =>
			existingChips.filter((chip) => chip.value?.id !== id)
		);
	}, []);

	const createChip = useCallback(
		({ label, id }: { label: string; id: string }) => ({
			label,
			value: {
				id,
				label,
				onCalendarRemove: () => removeSelectedCalendarChip(id)
			}
		}),
		[removeSelectedCalendarChip]
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

	const onSelectedCalendarsChange = useCallback((selected: CalendarChipInputItems) => {
		const selectedChips = uniqBy(selected, (chip) => chip.value?.id);
		setSelectedCalendarsChips(selectedChips);
	}, []);

	const onCalendarsAdd = useCallback<ReactEventHandler>(
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

	const onInputType = useCallback<NonNullable<ChipInputProps['onInputType']>>(
		({ key, textContent }) => {
			if (CHIP_INPUT_SEPARATORS.includes(key)) {
				if (options?.[0]) {
					const chip = createChip(options[0]);
					setSelectedCalendarsChips((prevValue) => [...prevValue, chip]);
					setInputContent('');
				}
			} else if (!isNil(textContent)) {
				setInputContent(textContent);
			}
		},
		[createChip, options]
	);

	const onFocus = useCallback(() => {
		setChipInputFocused((prev) => prev || true);
	}, []);

	return (
		<ChipInput
			data-testid={'calendar-selector-input'}
			options={options}
			disableOptions
			value={selectedCalendarsChips}
			onAdd={onSelectedCalendarsAdd}
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

export const MultipleCalendarSelector = ({
	onCalendarChange,
	calendarsToExclude
}: MultipleCalendarSelectorProps): ReactElement | null => {
	const [selectedCalendarsChips, setSelectedCalendarsChips] = useState<CalendarChipInputItems>([]);
	const [options, setOptions] = useState<ChipInputProps['options']>();
	const inputRef = useRef<HTMLInputElement>(null);
	const allCalendars = useFoldersMap();
	const [t] = useTranslation();

	const calendars = reject(
		allCalendars,
		(item) =>
			item.name === ROOT_NAME || (item as LinkFolder).oname === ROOT_NAME || isTrash(item.id)
	);

	const unselectedCalendars = useMemo(
		() =>
			differenceWith(
				calendars,
				selectedCalendarsChips,
				(val1, val2) => val1?.id === val2?.value?.id
			),
		[calendars, selectedCalendarsChips]
	);

	const calendarOptions = useMemo(
		() =>
			calendars.length
				? map(calendars, (cal) => {
						const color = setCalendarColor({ color: cal.color, rgb: cal.rgb });
						const labelName = hasId(cal, FOLDERS.CALENDAR)
							? t('label.calendar', 'Calendar')
							: cal.name;
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
					})
				: [{ id: 'no_options', label: 'no options available', disabled: true }],
		[t, calendars]
	);

	const filterOptions = useCallback(
		({ textContent }: { textContent: string | null }) => {
			const selectedOptions = differenceBy(
				calendarOptions,
				selectedCalendarsChips,
				(val) => val?.value?.id
			);
			const newOptions = selectedOptions?.filter(
				(option) =>
					!textContent || option?.label?.toLowerCase().startsWith(textContent.toLowerCase())
			);
			setOptions(newOptions);
		},
		[calendarOptions, selectedCalendarsChips]
	);

	const initOptions = useCallback(() => {
		filterOptions({ textContent: inputRef.current?.value ?? '' });
	}, [filterOptions]);

	const removeSelectedCalendarChip = useCallback((id: string): void => {
		setSelectedCalendarsChips((existingChips) =>
			existingChips.filter((chip) => chip.value?.id !== id)
		);
	}, []);

	const createChip = useCallback(
		({ label, id }: { label?: string; id: string }) => ({
			label,
			value: {
				id,
				label,
				onCalendarRemove: () => removeSelectedCalendarChip(id)
			}
		}),
		[removeSelectedCalendarChip]
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

	const onCalendarsAdd = useCallback<ReactEventHandler>(
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

	const onSelectedCalendarsChange = useCallback((selected: CalendarChipInputItems) => {
		const selectedChips = uniqBy(selected, (chip) => chip.value?.id);
		setSelectedCalendarsChips(selectedChips);
	}, []);

	const onInputType = useCallback<NonNullable<ChipInputProps['onInputType']>>(
		({ key, textContent }) => {
			if (CHIP_INPUT_SEPARATORS.includes(key)) {
				if (options?.[0]) {
					const chip = createChip(options[0]);
					setSelectedCalendarsChips((prevValue) => [...prevValue, chip]);
					const newOptions = calendarOptions.filter((opt) => opt.id !== options?.[0].id);
					setOptions(newOptions);
				}
			} else {
				filterOptions({ textContent });
			}
		},
		[calendarOptions, createChip, filterOptions, options]
	);

	const isCalendarAddDisabled = selectedCalendarsChips.length === 0;

	return (
		<ChipInput
			value={selectedCalendarsChips}
			options={options}
			onInputType={onInputType}
			onChange={onSelectedCalendarsChange}
			icon={'Plus'}
			inputRef={inputRef}
			separators={CHIP_INPUT_SEPARATORS.map((key) => ({ key, ctrlKey: false }))}
			requireUniqueChips
			onFocus={initOptions}
			ChipComponent={CalendarChip}
			onAdd={onSelectedCalendarsAdd}
			iconAction={onCalendarsAdd}
			data-testid={'calendar-selector-input'}
			disableOptions
			placeholder={t('label.calendar_selector.placeholder', 'Add Calendars')}
			iconDisabled={isCalendarAddDisabled}
		/>
	);
};
