/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useState } from 'react';

import { Button, Container, Divider, Row } from '@zextras/carbonio-design-system';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DailyPlanner } from './parts/daily-planner';
import { EditorActions } from './parts/editor-actions';
import { EditorAllDayCheckbox } from './parts/editor-allday-checkbox';
import { EditorAttachments } from './parts/editor-attachments';
import { EditorAttendees } from './parts/editor-attendees';
import { EditorCalendarSelector } from './parts/editor-calendar-selector';
import { EditorComposer } from './parts/editor-composer';
import { EditorDatePicker } from './parts/editor-date-picker';
import { EditorEquipments } from './parts/editor-equipments';
import { EditorFreeBusySelector } from './parts/editor-free-busy-selector';
import { EditorLocation } from './parts/editor-location';
import { EditorMeetingRooms } from './parts/editor-meeting-rooms';
import { EditorOrganizer } from './parts/editor-organizer';
import { EditorPrivateCheckbox } from './parts/editor-private-checkbox';
import { EditorReminder } from './parts/editor-reminder';
import { EditorResourcesController } from './parts/editor-resources-controller';
import { EditorSummary } from './parts/editor-summary';
import { EditorTimezone } from './parts/editor-time-zone';
import { EditorTitle } from './parts/editor-title';
import { EditorVirtualRoom } from './parts/editor-virtual-room';
import { EditorRecurrence } from './parts/recurrence';
import { useAppSelector } from '../../store/redux/hooks';
import {
	selectEditorEnd,
	selectEditorRecurrence,
	selectEditorStart
} from '../../store/selectors/editor';
import { EditorProps } from '../../types/editor';

function getWithinSameDay(startDate: number, endDate: number): boolean {
	const date1 = new Date(startDate);
	const date2 = new Date(endDate);

	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

export const EditorPanel = ({ editorId, expanded }: EditorProps): ReactElement | null => {
	const [showDailyPlanner, setShowDailyPlanner] = useState(false);
	const handleDailyPlannerButtonClick = (): void => {
		setShowDailyPlanner((state) => !state);
	};
	const startDate = useAppSelector(selectEditorStart(editorId));
	const endDate = useAppSelector(selectEditorEnd(editorId));
	const recur = useAppSelector(selectEditorRecurrence(editorId));
	const [t] = useTranslation();
	const isSingleInstanceAppointment = isEmpty(recur);
	const isWithinSameDay = getWithinSameDay(startDate ?? 0, endDate ?? 0);

	const dailyPlannerButtonDisabled = !isSingleInstanceAppointment || !isWithinSameDay;
	const dailyPlannerLabel = showDailyPlanner
		? t('editor.daily_planner.button.hide', 'hide organizer tool')
		: t('editor.daily_planner.button.show', 'show organizer tool');

	return editorId ? (
		<Container
			background={'gray5'}
			padding={{ horizontal: 'large', bottom: 'large' }}
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			style={{ overflow: 'auto' }}
			data-testid="EditorPanel"
		>
			<EditorActions editorId={editorId} />
			<EditorSummary editorId={editorId} />
			<Divider />
			<Container
				height="fit"
				background={'gray6'}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				padding={{ all: 'large', bottom: 'extralarge' }}
				style={{
					overflowY: 'auto'
				}}
			>
				<EditorOrganizer editorId={editorId} />
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<EditorTitle editorId={editorId} />
				</Row>
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<EditorLocation editorId={editorId} />
				</Row>
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<EditorMeetingRooms editorId={editorId} />
				</Row>
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<EditorEquipments editorId={editorId} />
				</Row>
				<EditorVirtualRoom editorId={editorId} />
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<EditorAttendees editorId={editorId} />
				</Row>
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<EditorFreeBusySelector editorId={editorId} />
				</Row>
				<EditorCalendarSelector editorId={editorId} />
				<Row height="fit" width="fill" padding={{ top: 'large' }} mainAlignment="flex-start">
					<EditorPrivateCheckbox editorId={editorId} />
				</Row>
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<EditorDatePicker editorId={editorId} />
				</Row>
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<EditorTimezone editorId={editorId} />
				</Row>
				<Row height="fit" width="fill" padding={{ top: 'large' }} mainAlignment="flex-start">
					<EditorAllDayCheckbox editorId={editorId} />
				</Row>
				{/* TODO: add daily planner button */}
				<Button
					onClick={handleDailyPlannerButtonClick}
					label={dailyPlannerLabel}
					disabled={dailyPlannerButtonDisabled}
					data-testid={'daily-planner-button'}
				/>
				{showDailyPlanner && <DailyPlanner editorId={editorId} />}
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<EditorReminder editorId={editorId} />
				</Row>
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<EditorRecurrence editorId={editorId} expanded={expanded} />
				</Row>
				<EditorAttachments editorId={editorId} expanded={expanded} />
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<EditorComposer editorId={editorId} />
				</Row>
			</Container>
			<EditorResourcesController editorId={editorId} />
		</Container>
	) : null;
};
