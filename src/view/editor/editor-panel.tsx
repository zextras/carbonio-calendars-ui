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
import { EditorAttendees } from './parts/editor-attendees';
import { EditorCalendarSelector } from './parts/editor-calendar-selector';
import { EditorComposer } from './parts/editor-composer';
import { EditorDatePicker } from './parts/editor-date-picker';
import { EditorDropZone } from './parts/editor-dropzone';
import { EditorRecurrence } from './parts/editor-recurrence';
import { EditorReminder } from './parts/editor-reminder';
import { EditorSummary } from './parts/editor-summary';
import { EditorFreeBusySelector } from './parts/editor-free-busy-selector';
import { EditorLocation } from './parts/editor-location';
import { EditorOrganizer } from './parts/editor-organizer';
import { EditorPrivateCheckbox } from './parts/editor-private-checkbox';
import { EditorTimezone } from './parts/editor-time-zone';
import { EditorTitle } from './parts/editor-title';
import { EditorVirtualRoom } from './parts/editor-virtual-room';

export const EditorPanel = ({ editorId, callbacks, expanded }: EditorProps): ReactElement | null =>
	editorId && callbacks ? (
		<Container
			background="gray5"
			padding={{ horizontal: 'large', bottom: 'large' }}
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			style={{ overflow: 'auto' }}
		>
			<EditorActions editorId={editorId} callbacks={callbacks} />
			<EditorSummary editorId={editorId} />
			<Divider />
			<EditorDropZone editorId={editorId} callbacks={callbacks}>
				<Container style={{ overflowY: 'auto' }} height="fit">
					<EditorOrganizer editorId={editorId} callbacks={callbacks} />
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorTitle editorId={editorId} callbacks={callbacks} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorLocation editorId={editorId} callbacks={callbacks} />
					</Row>
					<EditorVirtualRoom editorId={editorId} callbacks={callbacks} />
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorAttendees editorId={editorId} callbacks={callbacks} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorFreeBusySelector editorId={editorId} callbacks={callbacks} />
					</Row>
					<EditorCalendarSelector editorId={editorId} callbacks={callbacks} />
					<Row height="fit" width="fill" padding={{ top: 'large' }} mainAlignment="flex-start">
						<EditorPrivateCheckbox editorId={editorId} callbacks={callbacks} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorDatePicker editorId={editorId} callbacks={callbacks} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorTimezone editorId={editorId} callbacks={callbacks} expanded={expanded} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }} mainAlignment="flex-start">
						<EditorAllDayCheckbox editorId={editorId} callbacks={callbacks} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorReminder editorId={editorId} callbacks={callbacks} expanded={expanded} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorRecurrence editorId={editorId} callbacks={callbacks} expanded={expanded} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorComposer editorId={editorId} callbacks={callbacks} />
					</Row>
				</Container>
			</EditorDropZone>
		</Container>
	) : null;
