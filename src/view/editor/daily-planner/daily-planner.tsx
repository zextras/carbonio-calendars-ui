/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Row } from '@zextras/carbonio-design-system';

import { DailyPlannerHeaderNavigation } from './daily-planner-header-navigation';
import { TimeTable } from './time-table';
import { Participant, useParticipantsAvailability } from './use-participants-availability';
import { useParticipantsNonWorkingHours } from './use-participants-non-working-hours';
import { atMidnight, mapFreeBusyToDailyPlannerRow, onNextDay } from './utils';

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

	return (
		<>
			<Row width={'fill'} padding={{ top: 'large' }}>
				<DailyPlannerHeaderNavigation editorId={editorId} startDate={startDate} endDate={endDate} />
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
