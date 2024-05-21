/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TFunction } from 'i18next';

import { getTimeString } from '../hooks/use-get-event-timezone';

export const getAppointmentDurationString = (
	t: TFunction,
	start: number,
	end: number,
	allDay: boolean
): string => {
	const allDayLabel = t('label.all_day', 'All day');

	return getTimeString(start, end, allDay, allDayLabel);
};
