/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useState } from 'react';

import { Button, Row } from '@zextras/carbonio-design-system';
import { isEmpty, map, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DAILY_PLANNER_EVENT_TYPE } from './constants';
import { TimeTable } from './time-table';
import {
	DailyPlannerEvents,
	DailyPlannerEventType,
	DailyPlannerParticipantType,
	DailyPlannerRow
} from './types';
import {
	Participant,
	ParticipantAvailability,
	useParticipantsAvailability
} from './use-participants-availability';
import {
	useParticipantsNonWorkingHours,
	NonWorkingHours
} from './use-participants-non-working-hours';
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

function mapEvent(
	event: {
		startDateEpochMillis: number;
		endDateEpochMillis: number;
	},
	eventType: DailyPlannerEventType
): DailyPlannerEvents {
	return {
		...event,
		type: eventType
	};
}

function mapFreeBusyToDailyPlannerRow({
	email,
	participantType,
	availabilities,
	nonWorkingHours
}: {
	email: string;
	participantType: DailyPlannerParticipantType;
	availabilities: Record<string, ParticipantAvailability>;
	nonWorkingHours: Record<string, NonWorkingHours>;
}): DailyPlannerRow {
	const freeBusy = availabilities?.[email] ?? {
		free: [],
		busy: [],
		tentative: [],
		outOfOffice: [],
		unknown: []
	};
	const nonWorking = map(
		(nonWorkingHours?.[email]?.nonWorkingHours ?? []).map((event) =>
			mapEvent(event, DAILY_PLANNER_EVENT_TYPE.nonWorking)
		)
	);
	const eventsFree = freeBusy.free.map((event) => mapEvent(event, DAILY_PLANNER_EVENT_TYPE.free));
	const eventsBusy = freeBusy.busy.map((event) => mapEvent(event, DAILY_PLANNER_EVENT_TYPE.busy));
	const outOfOffice = freeBusy.outOfOffice.map((event) =>
		mapEvent(event, DAILY_PLANNER_EVENT_TYPE.outOfOffice)
	);
	const unknown = freeBusy.unknown.map((event) =>
		mapEvent(event, DAILY_PLANNER_EVENT_TYPE.unknown)
	);

	const eventsTentative = freeBusy.tentative.map((event) =>
		mapEvent(event, DAILY_PLANNER_EVENT_TYPE.tentative)
	);
	return {
		email,
		participantType,
		events: [
			...eventsFree,
			...nonWorking,
			...unknown,
			...eventsTentative,
			...eventsBusy,
			...outOfOffice
		]
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

function uniqByEmail(elements: Participant[]): Participant[] {
	return uniqBy(elements, 'email');
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

	// FIXME: when you add an attendee to the editor it is added to the store even if already present, but only one chip is shown.
	// We have to use uniqBy for this reason. It can be dropped once the editor/contact input has been fixed
	const equipment: Participant[] = (useAppSelector(selectEditorEquipment(editorId)) ?? []).map(
		(equipment) => ({
			email: equipment.email
		})
	);
	const attendees: Participant[] = uniqByEmail(
		(useAppSelector(selectEditorAttendees(editorId)) ?? []).map((at) => ({
			email: at.email
		}))
	);
	const optionalAttendees: Participant[] = uniqByEmail(
		(useAppSelector(selectEditorOptionalAttendees(editorId)) ?? []).map((at) => ({
			email: at.email
		}))
	);
	const meetingRoom: Participant[] = uniqByEmail(
		useAppSelector(selectEditorMeetingRoom(editorId)) ?? []
	).map((resource) => ({
		email: resource.email
	}));

	const participants = [
		{ email: sender.address ?? '' },
		...attendees,
		...meetingRoom,
		...equipment,
		...optionalAttendees
	];

	const startOfDay = atMidnight(new Date(startDate));
	const endOfDay = onNextDay(startOfDay);
	const startDateEpochMillis = startOfDay.getTime();
	const endDateEpochMillis = endOfDay.getTime();

	const participantAvailabilities = useParticipantsAvailability({
		participants,
		startDateEpochMillis,
		endDateEpochMillis
	});

	const participantWorkingHours = useParticipantsNonWorkingHours({
		participants,
		startDateEpochMillis,
		endDateEpochMillis
	});

	const participantRows = [
		mapFreeBusyToDailyPlannerRow({
			email: sender.address ?? '',
			participantType: 'organizer',
			availabilities: participantAvailabilities,
			nonWorkingHours: participantWorkingHours
		}),
		...attendees.map((attendee) =>
			mapFreeBusyToDailyPlannerRow({
				email: attendee.email,
				participantType: 'attendee',
				availabilities: participantAvailabilities,
				nonWorkingHours: participantWorkingHours
			})
		),
		...meetingRoom.map((room) =>
			mapFreeBusyToDailyPlannerRow({
				email: room.email,
				participantType: 'meetingRoom',
				availabilities: participantAvailabilities,
				nonWorkingHours: participantWorkingHours
			})
		),
		...equipment.map((equip) =>
			mapFreeBusyToDailyPlannerRow({
				email: equip.email,
				participantType: 'equipment',
				availabilities: participantAvailabilities,
				nonWorkingHours: participantWorkingHours
			})
		),
		...optionalAttendees.map((optionalAttendee) =>
			mapFreeBusyToDailyPlannerRow({
				email: optionalAttendee.email,
				participantType: 'optionalAttendee',
				availabilities: participantAvailabilities,
				nonWorkingHours: participantWorkingHours
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
