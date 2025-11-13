/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useCallback, useMemo, useRef, useState } from 'react';

import { ChipInput, ChipInputProps, ChipItem, DropdownItem } from '@zextras/carbonio-design-system';
import {
	ROOT_NAME,
	FOLDERS,
	isLink,
	isTrashed,
	useFoldersMap,
	Folder,
	LinkFolder,
	hasId
} from '@zextras/carbonio-ui-commons';
import { differenceWith, map, reject, sortBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { setCalendarColor } from '../../../normalizations/normalizations-utils';
import { ItemFactory } from '../../../view/editor/parts/select-label-factory';

export type MultipleCalendarSelectorProps = {
	onCalendarChange: (selectedCalendar: Folder) => void;
	excludedCalendarsIds?: Array<string>;
};
type InputOptions = Array<
	DropdownItem & { value?: { id: string; label: string; isLink: boolean } }
>;

type SelectedOptionsType = ChipItem<{ id: string; label: string; isLink: boolean }>[];

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
	const folders = useFoldersMap();
	const [options, setOptions] = useState<InputOptions>();
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

	const createOptions = useCallback(
		({
			namePrefix = '',
			excludedIds = []
		}: {
			namePrefix?: string;
			excludedIds?: Array<string>;
		} = {}): InputOptions => {
			if (!namePrefix || namePrefix.trim() === '') {
				return [];
			}
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

	const onSelectedCalendarsChange = useCallback(
		(selected: SelectedOptionsType) => {
			selected.forEach((item) => {
				const matchedCalendar = eligibleSortedCalendars.find((calendar) => calendar.id === item.id);
				if (matchedCalendar) {
					onCalendarChange(matchedCalendar);
				}
			});
		},
		[eligibleSortedCalendars, onCalendarChange]
	);

	const onInputType = useCallback<NonNullable<ChipInputProps['onInputType']>>(
		({ textContent }) => {
			setOptions(createOptions({ namePrefix: textContent ?? '' }));
		},
		[createOptions]
	);

	return (
		<ChipInput
			value={[]}
			options={options}
			disableOptions
			inputRef={inputRef}
			onInputTypeDebounce={0}
			onInputType={onInputType}
			onChange={onSelectedCalendarsChange}
			placeholder={t('label.calendars_group_selector.placeholder', 'Type a calendar')}
			separators={[]}
		/>
	);
};
