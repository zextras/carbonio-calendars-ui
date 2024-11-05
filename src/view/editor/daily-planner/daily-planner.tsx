/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useState } from 'react';

import { Button, Row } from '@zextras/carbonio-design-system';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import { TimeTable } from './time-table';
import { getAllParticipantsFreeBusy } from './utils';
import { useAttendeesAvailability } from '../../../hooks/use-attendees-availability';
import { useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAttendees,
	selectEditorEnd,
	selectEditorEquipment,
	selectEditorMeetingRoom,
	selectEditorOptionalAttendees,
	selectEditorRecurrence,
	selectEditorStart,
	selectSender
} from '../../../store/selectors/editor';

function getWithinSameDay(startDate: number, endDate: number): boolean {
	const date1 = new Date(startDate);
	const date2 = new Date(endDate);

	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

export const EditorDailyPlanner = ({ editorId }: { editorId: string }): React.JSX.Element => {
	// TODO set to false once implementation is done
	const [showDailyPlanner, setShowDailyPlanner] = useState(true);
	const handleDailyPlannerButtonClick = (): void => {
		setShowDailyPlanner((state) => !state);
	};
	const startDate = useAppSelector(selectEditorStart(editorId)) ?? 0;
	const endDate = useAppSelector(selectEditorEnd(editorId)) ?? 0;
	const recur = useAppSelector(selectEditorRecurrence(editorId));
	const [t] = useTranslation();
	const isSingleInstanceAppointment = isEmpty(recur);
	const isWithinSameDay = getWithinSameDay(startDate ?? 0, endDate ?? 0);

	const dailyPlannerButtonDisabled = !isSingleInstanceAppointment || !isWithinSameDay;
	const dailyPlannerLabel = showDailyPlanner
		? t('editor.daily_planner.button.hide', 'hide organizer tool')
		: t('editor.daily_planner.button.show', 'show organizer tool');

	const sender = useAppSelector(selectSender(editorId));
	const senderWithEmail = {
		...sender,
		email: sender?.address ?? ''
	};

	const equipment = useAppSelector(selectEditorEquipment(editorId)) ?? [];
	const attendees = useAppSelector(selectEditorAttendees(editorId)) ?? [];
	const optionalAttendees = useAppSelector(selectEditorOptionalAttendees(editorId)) ?? [];
	const meetingRoom = useAppSelector(selectEditorMeetingRoom(editorId)) ?? [];

	const allFreeBusy = useAttendeesAvailability(startDate, [
		senderWithEmail,
		...attendees,
		...meetingRoom,
		...equipment,
		...optionalAttendees
	]);

	const allParticipantsFB = getAllParticipantsFreeBusy(allFreeBusy);

	return (
		<>
			<Row height="fit" width="fill" padding={{ top: 'large' }} mainAlignment="center">
				<Button
					type={'outlined'}
					width={'fill'}
					onClick={handleDailyPlannerButtonClick}
					label={dailyPlannerLabel}
					disabled={dailyPlannerButtonDisabled}
					data-testid={'daily-planner-button'}
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
						rows={allParticipantsFB}
					/>
				</div>
			</Row>
		</>
	);
};
