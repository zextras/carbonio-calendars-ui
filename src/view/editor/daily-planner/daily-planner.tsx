/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useState } from 'react';

import { Button, Row } from '@zextras/carbonio-design-system';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DAILY_PLANNER_FREE_BUSY_TYPE } from './constants';
import { TimeTable } from './time-table';
import { DailyPlannerParticipantType, DailyPlannerRow } from './types';
import {
	Participant,
	ParticipantAvailability,
	useParticipantsAvailability
} from './useParticipantsAvailability';
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

function mapFreeBusyToDailyPlannerRow({
	email,
	participantType,
	availabilities
}: {
	email: string;
	participantType: DailyPlannerParticipantType;
	availabilities: Record<string, ParticipantAvailability>;
}): DailyPlannerRow {
	const freeBusy = availabilities?.[email] ?? { free: [], busy: [], tentative: [] };
	const eventsFree = freeBusy.free.map((event) => ({
		startDate: event.startDateEpochMillis,
		endDate: event.endDateEpochMillis,
		type: DAILY_PLANNER_FREE_BUSY_TYPE.free
	}));
	const eventsBusy = freeBusy.busy.map((event) => ({
		startDate: event.startDateEpochMillis,
		endDate: event.endDateEpochMillis,
		type: DAILY_PLANNER_FREE_BUSY_TYPE.busy
	}));
	const eventsTentative = freeBusy.tentative.map((event) => ({
		startDate: event.startDateEpochMillis,
		endDate: event.endDateEpochMillis,
		type: DAILY_PLANNER_FREE_BUSY_TYPE.tentative
	}));
	return {
		email,
		participantType,
		freeBusy: [...eventsFree, ...eventsBusy, ...eventsTentative]
	};
}
function atMidnight(date: Date): Date {
	const midnight = date;
	midnight.setHours(0, 0, 0, 0);
	return midnight;
}

function onNextDay(date: Date): Date {
	const nextDay = new Date(date);
	nextDay.setDate(nextDay.getDate() + 1);
	return nextDay;
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

	const equipment = (useAppSelector(selectEditorEquipment(editorId)) ?? []).map((equipment) => ({
		email: equipment.email
	}));
	const attendees: Participant[] = (useAppSelector(selectEditorAttendees(editorId)) ?? []).map(
		(at) => ({
			email: at.email
		})
	);
	const optionalAttendees = (useAppSelector(selectEditorOptionalAttendees(editorId)) ?? []).map(
		(at) => ({
			email: at.email
		})
	);
	const meetingRoom = (useAppSelector(selectEditorMeetingRoom(editorId)) ?? []).map((resource) => ({
		email: resource.email
	}));

	const participants = [
		{ email: sender.address },
		...attendees,
		...meetingRoom,
		...equipment,
		...optionalAttendees
	];
	const startOfDay = atMidnight(new Date(startDate));
	const endOfDay = onNextDay(startOfDay);
	const participantAvailabilities = useParticipantsAvailability({
		participants,
		startDateEpochMillis: startOfDay.getTime(),
		endDateEpochMillis: endOfDay.getTime()
	});

	const participantRows = [
		mapFreeBusyToDailyPlannerRow({
			email: sender.address ?? '',
			participantType: 'organizer',
			availabilities: participantAvailabilities
		}),
		...attendees.map((attendee) =>
			mapFreeBusyToDailyPlannerRow({
				email: attendee.email,
				participantType: 'attendee',
				availabilities: participantAvailabilities
			})
		),
		...meetingRoom.map((room) =>
			mapFreeBusyToDailyPlannerRow({
				email: room.email,
				participantType: 'meetingRoom',
				availabilities: participantAvailabilities
			})
		),
		...equipment.map((equip) =>
			mapFreeBusyToDailyPlannerRow({
				email: equip.email,
				participantType: 'equipment',
				availabilities: participantAvailabilities
			})
		),
		...optionalAttendees.map((optionalAttendee) =>
			mapFreeBusyToDailyPlannerRow({
				email: optionalAttendee.email,
				participantType: 'optionalAttendee',
				availabilities: participantAvailabilities
			})
		)
	];

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
						rows={participantRows}
					/>
				</div>
			</Row>
		</>
	);
};
