/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Container, Divider, Row } from '@zextras/carbonio-design-system';

import { EditorDailyPlannerController } from './daily-planner/daily-planner-controller';
import { EditorActions } from './parts/editor-actions';
import { EditorAllDayCheckbox } from './parts/editor-allday-checkbox';
import { EditorAttachments } from './parts/editor-attachments';
import { EditorAttendees } from './parts/editor-attendees';
import { EditorCalendarSelector } from './parts/editor-calendar-selector';
import { EditorComposer } from './parts/editor-composer';
import { EditorDatePicker } from './parts/editor-date-picker';
import { EditorFreeBusySelector } from './parts/editor-free-busy-selector';
import { EditorLocation } from './parts/editor-location';
import { EditorPrivateCheckbox } from './parts/editor-private-checkbox';
import { EditorReminder } from './parts/editor-reminder';
import { EditorResources } from './parts/editor-resources';
import { EditorSender } from './parts/editor-sender';
import { EditorSummary } from './parts/editor-summary';
import { EditorTimezone } from './parts/editor-time-zone';
import { EditorTitle } from './parts/editor-title';
import { EditorVirtualRoom } from './parts/editor-virtual-room';
import { EditorRecurrence } from './parts/recurrence';
import { EditorProps } from '../../types/editor';

export const EditorPanel = ({ editorId, expanded }: EditorProps): ReactElement => (
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
			<EditorSender editorId={editorId} />
			<Row height="fit" width="fill" padding={{ top: 'large' }}>
				<EditorTitle editorId={editorId} />
			</Row>
			<Row height="fit" width="fill" padding={{ top: 'large' }}>
				<EditorLocation editorId={editorId} />
			</Row>
			<EditorResources editorId={editorId} />
			<EditorVirtualRoom editorId={editorId} />
			<Row height="fit" width="fill" padding={{ top: 'large' }}>
				<EditorAttendees editorId={editorId} />
			</Row>
			<EditorCalendarSelector editorId={editorId} />
			<Row height="fit" width="fill" padding={{ top: 'large' }}>
				<EditorFreeBusySelector editorId={editorId} />
			</Row>
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
			<EditorDailyPlannerController editorId={editorId} />
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
	</Container>
);
