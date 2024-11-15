/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { useTheme } from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { EventDiv } from './parts/event-div';
import { DailyPlannerEvents } from './types';
import { getEventColor, getEventTooltipLabel, getLocalHoursMinutesFromEpoch } from './utils';

export const TimeTableEvent = ({ event }: { event: DailyPlannerEvents }): React.JSX.Element => {
	const theme = useTheme();
	const startHoursMinutes = getLocalHoursMinutesFromEpoch(event.startDateEpochMillis);
	const timeSpan = (event.endDateEpochMillis - event.startDateEpochMillis) / (1000 * 60);
	const locale = useUserSettings().prefs.zimbraPrefLocale ?? 'en-US';
	const [t] = useTranslation();

	const tooltipLabel = getEventTooltipLabel(event, t, locale);

	return (
		<EventDiv
			dataTestId={event.type}
			startPosition={startHoursMinutes.hours * 60 + startHoursMinutes.minutes}
			eventTimeSpan={timeSpan}
			tooltipLabel={tooltipLabel}
			color={getEventColor(event.type, theme)}
		/>
	);
};
