/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Divider, Row } from '@zextras/carbonio-design-system';
import React, { ReactElement } from 'react';
import { EditorProps } from '../../types/editor';
import { EditorAllDayCheckbox } from './parts/editor-allday-checkbox';
import { EditorActions } from './parts/editor-actions';
import { EditorAttachments } from './parts/editor-attachments';
import { EditorAttendees } from './parts/editor-attendees';
import { EditorCalendarSelector } from './parts/editor-calendar-selector';
import { EditorComposer } from './parts/editor-composer';
import { EditorDatePicker } from './parts/editor-date-picker';
import { EditorDropZone } from './parts/editor-dropzone';
import { EditorReminder } from './parts/editor-reminder';
import { EditorSummary } from './parts/editor-summary';
import { EditorFreeBusySelector } from './parts/editor-free-busy-selector';
import { EditorLocation } from './parts/editor-location';
import { EditorOrganizer } from './parts/editor-organizer';
import { EditorPrivateCheckbox } from './parts/editor-private-checkbox';
import { EditorTimezone } from './parts/editor-time-zone';
import { EditorTitle } from './parts/editor-title';
import { EditorVirtualRoom } from './parts/editor-virtual-room';
import { EditorRecurrence } from './parts/recurrence';

export const EditorPanel = ({ editorId, expanded }: EditorProps): ReactElement | null =>
	editorId ? (
		<Container
			background="gray5"
			padding={{ horizontal: 'large', bottom: 'large' }}
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			style={{ overflow: 'auto' }}
			data-testid="EditorPanel"
		>
			<EditorActions editorId={editorId} />
			<EditorSummary editorId={editorId} />
			<Divider />
			<EditorDropZone editorId={editorId}>
				<Container style={{ overflowY: 'auto' }} height="fit">
					<EditorOrganizer editorId={editorId} />
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorTitle editorId={editorId} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorLocation editorId={editorId} />
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
						<EditorTimezone editorId={editorId} expanded={expanded} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }} mainAlignment="flex-start">
						<EditorAllDayCheckbox editorId={editorId} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorReminder editorId={editorId} expanded={expanded} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorRecurrence editorId={editorId} expanded={expanded} />
					</Row>
					<EditorAttachments editorId={editorId} expanded={expanded} />
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorComposer editorId={editorId} />
					</Row>
				</Container>
			</EditorDropZone>
		</Container>
	) : null;
