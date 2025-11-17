/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { useUserSettings } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { CalendarToolbar } from '../../../components/calendar-toolbar';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorOriginalEnd,
	selectEditorOriginalStart
} from '../../../store/selectors/editor';
import { editEditorDate } from '../../../store/slices/editor-slice';

export const ONE_DAY_IN_MILLIS = 86400000;

export const DailyPlannerHeaderNavigation = ({
	editorId,
	startDate,
	endDate
}: {
	editorId: string;
	startDate: number;
	endDate: number;
}): React.JSX.Element => {
	const originalStart = useAppSelector(selectEditorOriginalStart(editorId)) ?? 0;
	const originalEnd = useAppSelector(selectEditorOriginalEnd(editorId)) ?? 0;

	const dispatch = useAppDispatch();
	const userSetting = useUserSettings().prefs.zimbraPrefLocale;
	const locale = useMemo(() => userSetting ?? navigator.language, [userSetting]);

	const [t] = useTranslation();

	const onTodayAction = useCallback(() => {
		dispatch(
			editEditorDate({
				id: editorId,
				start: originalStart,
				end: originalEnd
			})
		);
	}, [dispatch, editorId, originalStart, originalEnd]);

	const onRightArrowAction = useCallback(() => {
		dispatch(
			editEditorDate({
				id: editorId,
				start: startDate + ONE_DAY_IN_MILLIS,
				end: endDate + ONE_DAY_IN_MILLIS
			})
		);
	}, [dispatch, editorId, startDate, endDate]);

	const onLeftArrowAction = useCallback(() => {
		dispatch(
			editEditorDate({
				id: editorId,
				start: startDate - ONE_DAY_IN_MILLIS,
				end: endDate - ONE_DAY_IN_MILLIS
			})
		);
	}, [dispatch, editorId, startDate, endDate]);

	const dateLabel = useMemo(
		() =>
			new Intl.DateTimeFormat(locale, {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			}).format(startDate),
		[locale, startDate]
	);

	return (
		<CalendarToolbar
			dateLabel={dateLabel}
			resetButtonLabel={t('reset_date', 'Reset Date')}
			rightArrowLabel={t('next_day', 'Next day')}
			leftArrowLabel={t('previous_day', 'Previous day')}
			onResetAction={onTodayAction}
			onRightArrowAction={onRightArrowAction}
			onLeftArrowAction={onLeftArrowAction}
		/>
	);
};
