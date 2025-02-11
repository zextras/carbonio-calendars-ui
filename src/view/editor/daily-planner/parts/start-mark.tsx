/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Tooltip, useTheme } from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { MinutesLine } from './minutes-line';
import {
	getDefaultLineColors,
	getHumanReadableHours,
	getLocalHoursMinutesFromEpoch
} from '../utils';

export const StartMark = ({
	startTimeEpochMillis
}: {
	startTimeEpochMillis: number;
}): React.JSX.Element => {
	const theme = useTheme();
	const locale = useUserSettings().prefs.zimbraPrefLocale ?? 'en-US';
	const { hours, minutes } = getLocalHoursMinutesFromEpoch(startTimeEpochMillis);
	const atPosition = hours * 60 + minutes;
	const [t] = useTranslation();
	const defaultLineColors = getDefaultLineColors(theme);
	const tooltipLabel = `${t('daily_planner.start_time', 'Start time')}: ${getHumanReadableHours(startTimeEpochMillis, locale)}`;
	return (
		<Tooltip label={tooltipLabel}>
			<MinutesLine
				data-testid={'start-mark'}
				$atPosition={atPosition}
				$color={defaultLineColors.start}
			/>
		</Tooltip>
	);
};
