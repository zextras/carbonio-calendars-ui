/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Row } from '@zextras/carbonio-design-system';

import { TimeTable } from './time-table';
import { DailyPlannerRow } from './types';
import { getAllParticipantsFreeBusy } from './utils';
import { useAttendeesAvailability } from '../../../hooks/use-attendees-availability';
import { useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditorAttendees,
	selectEditorEnd,
	selectEditorStart,
	selectSender
} from '../../../store/selectors/editor';

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

	const allParticipantsFB: Array<DailyPlannerRow> = getAllParticipantsFreeBusy(allFreeBusy);

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
					rows={allParticipantsFB}
				/>
			</div>
		</Row>
	);
};
