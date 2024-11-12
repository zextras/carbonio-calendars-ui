/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Row } from '@zextras/carbonio-design-system';
import { map } from 'lodash';

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
	fullName,
	participantType,
	availabilities,
	nonWorkingHours
}: {
	email: string;
	participantType: DailyPlannerParticipantType;
	fullName?: string;
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
		fullName,
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

export const EditorDailyPlanner = ({
	startDate,
	endDate,
	participants
}: {
	startDate: number;
	endDate: number;
	participants: Participant[];
}): React.JSX.Element => {
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

	const participantRows = participants.map((participant) =>
		mapFreeBusyToDailyPlannerRow({
			email: participant.email,
			fullName: participant.fullName,
			participantType: participant.type,
			availabilities: participantAvailabilities,
			nonWorkingHours: participantWorkingHours
		})
	);

	return (
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
	);
};
