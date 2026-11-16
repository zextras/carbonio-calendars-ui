/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { RefObject } from 'react';

import { Checkbox, Input, Padding } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { CalendarColorPicker } from 'commons/calendar-color-picker';

type AddExternalCalendarModalIcsFlowProps = {
	calendarUrl: string;
	urlError?: string;
	urlDescription?: string;
	isDuplicateCalendarUrl: boolean;
	isSubmitting: boolean;
	isColorPickerOpen?: boolean;
	calendarName: string;
	isDuplicateCalendarName: boolean;
	selectedColorHex: string;
	excludeFreeBusy: boolean;
	onCalendarUrlChange: (value: string) => void;
	onCalendarNameChange: (value: string) => void;
	onSelectedColorHexChange: (value: string) => void;
	onColorPickerOpenChange?: (open: boolean) => void;
	onExcludeFreeBusyChange: (value: boolean) => void;
	calendarUrlInputRef?: RefObject<HTMLInputElement>;
};

export const AddExternalCalendarModalIcsFlow = ({
	calendarUrl,
	urlError,
	urlDescription,
	isDuplicateCalendarUrl,
	isSubmitting,
	isColorPickerOpen = false,
	calendarName,
	isDuplicateCalendarName,
	selectedColorHex,
	excludeFreeBusy,
	onCalendarUrlChange,
	onCalendarNameChange,
	onSelectedColorHexChange,
	onColorPickerOpenChange,
	onExcludeFreeBusyChange,
	calendarUrlInputRef
}: AddExternalCalendarModalIcsFlowProps): JSX.Element => {
	const [t] = useTranslation();

	return (
		<>
			<Input
				label={`${t('add_ics_from_url.url', 'Calendar URL')}*`}
				background={'gray5'}
				hasError={!!urlError || isDuplicateCalendarUrl}
				description={
					urlDescription ??
					t(
						'add_ics_from_url.sync_info',
						'This calendar will be read-only and will sync every 12 hours'
					)
				}
				value={calendarUrl}
				disabled={isSubmitting || isColorPickerOpen}
				onChange={(event): void => onCalendarUrlChange(event.target.value)}
				inputRef={calendarUrlInputRef}
			/>
			<Padding top="medium" />
			<Input
				label={`${t('label.choose_representative_name', 'Choose a representative name')}*`}
				background={'gray5'}
				hasError={isDuplicateCalendarName}
				description={
					isDuplicateCalendarName
						? t(
								'add_ics_from_url.error.duplicate_calendar_name',
								'A calendar with the same name already exists'
							)
						: undefined
				}
				value={calendarName}
				disabled={isSubmitting || isColorPickerOpen}
				onChange={(event): void => onCalendarNameChange(event.target.value)}
			/>
			<Padding top="medium" />
			<CalendarColorPicker
				value={selectedColorHex}
				onChange={onSelectedColorHexChange}
				onOpenChange={onColorPickerOpenChange}
				disabled={isSubmitting}
			/>
			<Padding top="medium" />
			<Checkbox
				value={excludeFreeBusy}
				onClick={(): void => onExcludeFreeBusyChange(!excludeFreeBusy)}
				disabled={isSubmitting || isColorPickerOpen}
				label={t(
					'label.exclude_free_busy',
					'Exclude this calendar when reporting the free/busy times'
				)}
			/>
		</>
	);
};
