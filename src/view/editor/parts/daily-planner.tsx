/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Row } from '@zextras/carbonio-design-system';

import { useAttendeesAvailability } from '../../../hooks/use-attendees-availability';
import { useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAttendees,
	selectEditorEnd,
	selectEditorStart,
	selectSender
} from '../../../store/selectors/editor';
import { DAILY_PLANNER_FREE_BUSY_TYPE } from '../daily-planner/constants';
import { TimeTable } from '../daily-planner/time-table';
import { DailyPlannerRow } from '../daily-planner/types';

export const DailyPlanner = ({ editorId }: { editorId: string }): React.JSX.Element => {
	const sender = useAppSelector(selectSender(editorId));
	const senderWithEmail = {
		...sender,
		email: sender.address as string
	};

	const attendees = useAppSelector(selectEditorAttendees(editorId));

	const startDate = useAppSelector(selectEditorStart(editorId)) as number;
	const endDate = useAppSelector(selectEditorEnd(editorId)) as number;
	const allFreeBusy = useAttendeesAvailability(startDate, [senderWithEmail, ...attendees]);

	const allParticipantsFB: DailyPlannerRow[] = allFreeBusy
		? allFreeBusy.map((attendeeFb) => {
				const eventsFree = attendeeFb.f.map((event) => ({
					startDate: event.s,
					endDate: event.e,
					type: DAILY_PLANNER_FREE_BUSY_TYPE.free
				}));
				const eventsBusy = attendeeFb.b.map((event) => ({
					startDate: event.s,
					endDate: event.e,
					type: DAILY_PLANNER_FREE_BUSY_TYPE.busy
				}));
				const eventsTentative = attendeeFb.t.map((event) => ({
					startDate: event.s,
					endDate: event.e,
					type: DAILY_PLANNER_FREE_BUSY_TYPE.tentative
				}));
				return {
					email: attendeeFb.email,
					freeBusy: [...eventsFree, ...eventsBusy, ...eventsTentative]
				};
			})
		: [];

	return (
		<Row
			orientation={'horizontal'}
			width="fill"
			mainAlignment={'flex-start'}
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
	);
};
