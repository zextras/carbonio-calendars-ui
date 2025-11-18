/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo, useState } from 'react';

import { Button, Row } from '@zextras/carbonio-design-system';
import { isEmpty, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DAILY_PLANNER_PARTICIPANT_TYPE } from './constants';
import { EditorDailyPlanner } from './daily-planner';
import { Participant } from './use-participants-availability';
import { getWithinSameDay } from './utils';
import { useAppSelector } from '../../../store/redux/hooks';
import {
	selectEditor,
	selectEditorAttendees,
	selectEditorEnd,
	selectEditorEquipment,
	selectEditorMeetingRoom,
	selectEditorOptionalAttendees,
	selectEditorRecurrence,
	selectEditorStart,
	selectEditorTimezone,
	selectSender
} from '../../../store/selectors/editor';

function uniqByEmail<T>(elements: Array<T>): Array<T> {
	return uniqBy(elements, 'email');
}

export const EditorDailyPlannerController = ({
	editorId
}: {
	editorId: string;
}): React.JSX.Element => {
	const start = useAppSelector(selectEditorStart(editorId)) ?? 0;
	const end = useAppSelector(selectEditorEnd(editorId)) ?? 0;
	const timezone = useAppSelector(selectEditorTimezone(editorId));
	const recur = useAppSelector(selectEditorRecurrence(editorId));
	const sender = useAppSelector(selectSender(editorId));
	const currentAppointmentUid = useAppSelector(selectEditor(editorId)).uid;

	const equipment = (useAppSelector(selectEditorEquipment(editorId)) ?? []).map((equip) => ({
		email: equip.email,
		type: DAILY_PLANNER_PARTICIPANT_TYPE.equipment,
		fullName: equip.label
	}));
	const isSingleInstanceAppointment = isEmpty(recur);
	const startDate = useMemo(
		() =>
			new Date(
				new Date(start ?? 0).toLocaleString('en-US', {
					timeZone: timezone
				})
			).getTime(),
		[start, timezone]
	);

	const endDate = useMemo(
		() =>
			new Date(
				new Date(end ?? 0).toLocaleString('en-US', {
					timeZone: timezone
				})
			).getTime(),
		[end, timezone]
	);

	const isWithinSameDay = getWithinSameDay(startDate ?? 0, endDate ?? 0);

	const dailyPlannerEnabled = isSingleInstanceAppointment && isWithinSameDay;
	const [showDailyPlanner, setShowDailyPlanner] = useState(false);
	const [t] = useTranslation();
	const handleDailyPlannerButtonClick = (): void => {
		setShowDailyPlanner((state) => !state);
	};

	const dailyPlannerLabel = showDailyPlanner
		? t('editor.daily_planner.button.hide', 'hide organizer tool')
		: t('editor.daily_planner.button.show', 'show organizer tool');

	const attendees: Participant[] = uniqByEmail(
		(useAppSelector(selectEditorAttendees(editorId)) ?? []).map((at) => ({
			email: at.email,
			fullName: at.fullName,
			type: DAILY_PLANNER_PARTICIPANT_TYPE.attendee
		}))
	);
	const optionalAttendees: Participant[] = uniqByEmail(
		(useAppSelector(selectEditorOptionalAttendees(editorId)) ?? []).map((at) => ({
			email: at.email,
			fullName: at.fullName,
			type: DAILY_PLANNER_PARTICIPANT_TYPE.optionalAttendee
		}))
	);
	const meetingRoom: Participant[] = uniqByEmail(
		useAppSelector(selectEditorMeetingRoom(editorId)) ?? []
	).map((resource) => ({
		email: resource.email,
		type: DAILY_PLANNER_PARTICIPANT_TYPE.meetingRoom
	}));

	const participants = [
		{
			email: sender.email ?? '',
			type: DAILY_PLANNER_PARTICIPANT_TYPE.organizer,
			fullName: sender.fullName
		},
		...attendees,
		...meetingRoom,
		...equipment,
		...optionalAttendees
	];

	return dailyPlannerEnabled ? (
		<>
			<Row height="fit" width="fill" padding={{ top: 'large' }} mainAlignment="center">
				<Button
					type={'outlined'}
					width={'fill'}
					onClick={handleDailyPlannerButtonClick}
					label={dailyPlannerLabel}
					data-testid={'daily-planner-button'}
				/>
			</Row>
			{showDailyPlanner && (
				<EditorDailyPlanner
					editorId={editorId}
					startDate={startDate}
					endDate={endDate}
					participants={participants}
					currentAppointmentUid={currentAppointmentUid}
				/>
			)}
		</>
	) : (
		<></>
	);
};
