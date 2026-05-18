/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { RefObject } from 'react';

import { Input, Padding, Select } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { CalendarColorLabelFactory, buildCalendarColorItems } from 'commons/calendar-color-picker';

type AddExternalCalendarModalIcsFlowProps = {
	calendarUrl: string;
	urlError?: string;
	urlDescription?: string;
	isDuplicateCalendarUrl: boolean;
	isSubmitting: boolean;
	calendarName: string;
	isDuplicateCalendarName: boolean;
	selectedColor: string;
	colorItems: ReturnType<typeof buildCalendarColorItems>;
	onCalendarUrlChange: (value: string) => void;
	onCalendarNameChange: (value: string) => void;
	onSelectedColorChange: (value: string) => void;
	calendarUrlInputRef?: RefObject<HTMLInputElement>;
};

export const AddExternalCalendarModalIcsFlow = ({
	calendarUrl,
	urlError,
	urlDescription,
	isDuplicateCalendarUrl,
	isSubmitting,
	calendarName,
	isDuplicateCalendarName,
	selectedColor,
	colorItems,
	onCalendarUrlChange,
	onCalendarNameChange,
	onSelectedColorChange,
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
				disabled={isSubmitting}
				onChange={(event): void => onCalendarUrlChange(event.target.value)}
				inputRef={calendarUrlInputRef}
			/>
			<Padding top="medium" />
			<Input
				label={`${t('add_ics_from_url.calendar_name', 'Calendar name')}*`}
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
				disabled={isSubmitting}
				onChange={(event): void => onCalendarNameChange(event.target.value)}
			/>
			<Padding top="medium" />
			<Select
				label={t('label.select_color', 'Select color')}
				items={colorItems}
				defaultSelection={colorItems.find((item) => item.value === selectedColor) ?? colorItems[0]}
				LabelFactory={CalendarColorLabelFactory}
				disabled={isSubmitting}
				onChange={(value): void => {
					if (value) {
						onSelectedColorChange(value);
					}
				}}
			/>
		</>
	);
};
