/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback } from 'react';

import { Chip, ChipItem, ChipProps } from '@zextras/carbonio-design-system';

import { ZIMBRA_STANDARD_COLORS } from '../../../carbonio-ui-commons/constants';
import { useFolder } from '../../../carbonio-ui-commons/store/zustand/folder';

export type CalendarChipInputItem = ChipItem<{
	id: string;
	label: string;
	onCalendarRemove: (calendarId: string) => void;
}>;

export type CalendarChipInputItems = Array<CalendarChipInputItem>;

export const CalendarChip: FC<CalendarChipInputItem> = ({ value }) => {
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
