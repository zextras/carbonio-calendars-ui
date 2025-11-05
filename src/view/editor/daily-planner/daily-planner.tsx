/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo, useState } from 'react';

import { Row } from '@zextras/carbonio-design-system';
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

import { TimeTable } from './time-table';
import { Participant, useParticipantsAvailability } from './use-participants-availability';
import { useParticipantsNonWorkingHours } from './use-participants-non-working-hours';
import { atMidnight, mapFreeBusyToDailyPlannerRow, onNextDay } from './utils';
import { CalendarToolbar } from '../../../components/calendar-toolbar';
import { useAppDispatch, useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorOriginalEnd,
	selectEditorOriginalStart
} from '../../../store/selectors/editor';
import { editEditorDate } from '../../../store/slices/editor-slice';

export const EditorDailyPlanner = ({
	editorId,
	startDate,
	endDate,
	participants,
	currentAppointmentUid
}: {
	editorId: string;
	startDate: number;
	endDate: number;
	participants: Participant[];
	currentAppointmentUid?: string;
}): React.JSX.Element => {
	const startOfDay = atMidnight(new Date(startDate));
	const endOfDay = onNextDay(startOfDay);
	const startDateEpochMillis = startOfDay.getTime();
	const endDateEpochMillis = endOfDay.getTime();

	const originalStart = useAppSelector(selectEditorOriginalStart(editorId)) ?? 0;
	const originalEnd = useAppSelector(selectEditorOriginalEnd(editorId)) ?? 0;

	const dispatch = useAppDispatch();
	const userSetting = useUserSettings().prefs.zimbraPrefLocale;
	const locale = useMemo(() => userSetting ?? navigator.language, [userSetting]);
	const [headerStart, setHeaderStart] = useState(startDate);
	const [headerEnd, setHeaderEnd] = useState(endDate);

	const [t] = useTranslation();

	const participantAvailabilities = useParticipantsAvailability({
		participants,
		startDateEpochMillis,
		endDateEpochMillis,
		excludeAppointmentUid: currentAppointmentUid
	});

	const participantWorkingHours = useParticipantsNonWorkingHours({
		participants,
		startDateEpochMillis,
		endDateEpochMillis
	});

	const participantRows = participants.map((participant) =>
		mapFreeBusyToDailyPlannerRow({
			email: participant.email,
			fullName: participant.fullName,
			participantType: participant.type,
			availabilities: participantAvailabilities,
			nonWorkingHours: participantWorkingHours
		})
	);

	const debounceNavigation = useMemo(
		() =>
			debounce(
				(debounceStart: number, debounceEnd: number) => {
					dispatch(editEditorDate({ id: editorId, start: debounceStart, end: debounceEnd }));
				},
				250,
				{
					trailing: true,
					leading: false
				}
			),
		[dispatch, editorId]
	);
	const onTodayAction = useCallback(() => {
		setHeaderStart(originalStart);
		setHeaderEnd(originalEnd);
		debounceNavigation(originalStart, originalEnd);
	}, [debounceNavigation, originalEnd, originalStart]);

	const onRightArrowAction = useCallback(() => {
		setHeaderStart((prevState) => prevState + 86400000);
		setHeaderEnd((prevState) => prevState + 86400000);
		debounceNavigation(headerStart + 86400000, headerEnd + 86400000);
	}, [debounceNavigation, headerEnd, headerStart]);

	const onLeftArrowAction = useCallback(() => {
		setHeaderStart((prevState) => prevState - 86400000);
		setHeaderEnd((prevState) => prevState - 86400000);
		debounceNavigation(headerStart - 86400000, headerEnd - 86400000);
	}, [debounceNavigation, headerStart, headerEnd]);

	const dateLabel = useMemo(
		() =>
			new Intl.DateTimeFormat(locale, {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			}).format(headerStart),
		[locale, headerStart]
	);

	return (
		<>
			<Row width={'fill'} padding={{ top: 'large' }}>
				<CalendarToolbar
					dateLabel={dateLabel}
					todayLabel={t('reset_date', 'Reset Date')}
					rightArrowLabel={t('next_day', 'Next day')}
					leftArrowLabel={t('previous_day', 'Previous day')}
					onTodayAction={onTodayAction}
					onRightArrowAction={onRightArrowAction}
					onLeftArrowAction={onLeftArrowAction}
				/>
			</Row>
			<Row
				orientation={'horizontal'}
				width="fill"
				mainAlignment={'flex-start'}
				padding={{ right: '1rem', vertical: '1rem' }}
				style={{ flexWrap: 'nowrap' }}
			>
				<div style={{ width: '100%', position: 'relative' }}>
					<TimeTable
						appointmentStartDate={startDate}
						appointmentEndDate={endDate}
						rows={participantRows}
					/>
				</div>
			</Row>
		</>
	);
};
