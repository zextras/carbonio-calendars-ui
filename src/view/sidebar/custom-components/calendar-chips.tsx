/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback } from 'react';

import { Chip, ChipItem, ChipProps } from '@zextras/carbonio-design-system';

import { useFolder } from '../../../carbonio-ui-commons/store/zustand/folder';
import { CALENDARS_STANDARD_COLORS } from '../../../constants/calendar';

export type CalendarChipInputItem = ChipItem<{
	id: string;
	label?: string;
	onCalendarRemove: (calendarId: string) => void;
}>;

export type CalendarChipInputItems = Array<CalendarChipInputItem>;

export const CalendarChip: FC<CalendarChipInputItem> = ({ value }) => {
	const calendar = useFolder(value?.id ?? '');

	const label = calendar?.name ?? '';
	const fgColor = CALENDARS_STANDARD_COLORS[calendar?.color ?? 0].color;
	const bgColor = CALENDARS_STANDARD_COLORS[calendar?.color ?? 0].background;

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

	return calendar && fgColor ? (
		<Chip
			key={value?.id}
			label={label}
			avatarColor={fgColor}
			avatarIcon={'Square2'}
			avatarBackground="transparent"
			size={'small'}
			borderColor={fgColor}
			// There is some type issue with the background prop, but it is working
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			background={bgColor}
			onClose={onChipClose}
		/>
	) : null;
};
