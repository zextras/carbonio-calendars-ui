/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo } from 'react';

import { ColorPicker } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { CALENDARS_STANDARD_COLORS } from 'constants/calendar';

/**
 * Resolves a folder's color into a single hex string: an `rgb` custom color takes precedence,
 * otherwise the standard color at `color` index, defaulting to the first standard color.
 */
export const resolveCalendarColorHex = (
	color: number | undefined,
	rgb: string | undefined
): string =>
	rgb ?? CALENDARS_STANDARD_COLORS[color ?? 0]?.color ?? CALENDARS_STANDARD_COLORS[0].color;

export type CalendarColorPickerProps = {
	/** Current color, as hex. Use `resolveCalendarColorHex` to derive it from a folder. */
	value: string;
	onChange: (hex: string) => void;
	/** Notified whenever the custom-color popover opens/closes, e.g. to disable sibling controls. */
	onOpenChange?: (open: boolean) => void;
	disabled?: boolean;
};

/** The shared `ColorPicker`, bound to the calendar palette. */
export const CalendarColorPicker: FC<CalendarColorPickerProps> = (props) => {
	const [t] = useTranslation();

	const colors = useMemo(
		() =>
			CALENDARS_STANDARD_COLORS.map((color) => ({
				hex: color.color,
				label: t(`colors.${color.label}`)
			})),
		[t]
	);

	return (
		<ColorPicker
			colors={colors}
			caption={t(
				'label.choose_color_caption',
				'Choose a color to make this calendar easier to recognize'
			)}
			{...props}
		/>
	);
};
