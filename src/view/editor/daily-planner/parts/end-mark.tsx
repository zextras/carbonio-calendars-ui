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

export const EndMark = ({
	endTimeEpochMillis
}: {
	endTimeEpochMillis: number;
}): React.JSX.Element => {
	const theme = useTheme();
	const locale = useUserSettings().prefs.zimbraPrefLocale ?? 'en-US';
	const [t] = useTranslation();
	const tooltipLabel = `${t('daily_planner.end_time', 'End time')}: ${getHumanReadableHours(endTimeEpochMillis, locale)}`;
	const { hours, minutes } = getLocalHoursMinutesFromEpoch(endTimeEpochMillis);
	const atPosition = hours * 60 + minutes;
	const defaultLineColors = getDefaultLineColors(theme);
	return (
		<Tooltip label={tooltipLabel}>
			<MinutesLine
				data-testid={'end-mark'}
				$atPosition={atPosition}
				$color={defaultLineColors.end}
			/>
		</Tooltip>
	);
};
