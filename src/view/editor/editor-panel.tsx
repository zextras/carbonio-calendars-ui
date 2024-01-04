/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Container, Divider, Row } from '@zextras/carbonio-design-system';

import { EditorActions } from './parts/editor-actions';
import { EditorAllDayCheckbox } from './parts/editor-allday-checkbox';
import { EditorAttachments } from './parts/editor-attachments';
import { EditorAttendees } from './parts/editor-attendees';
import { EditorCalendarSelector } from './parts/editor-calendar-selector';
import { EditorComposer } from './parts/editor-composer';
import { EditorDatePicker } from './parts/editor-date-picker';
import { EditorDropZone } from './parts/editor-dropzone';
import { EditorEquipment } from './parts/editor-equipment';
import { EditorFreeBusySelector } from './parts/editor-free-busy-selector';
import { EditorLocation } from './parts/editor-location';
import { EditorMeetingRooms } from './parts/editor-meeting-rooms';
import { EditorOrganizer } from './parts/editor-organizer';
import { EditorPrivateCheckbox } from './parts/editor-private-checkbox';
import { EditorReminder } from './parts/editor-reminder';
import { EditorResourceComponent } from './parts/editor-resource-component';
import { EditorResourcesController, EditorResourcesControllerV2 } from './parts/editor-resources-controller';
import { EditorSummary } from './parts/editor-summary';
import { EditorTimezone } from './parts/editor-time-zone';
import { EditorTitle } from './parts/editor-title';
import { EditorVirtualRoom } from './parts/editor-virtual-room';
import { NewEquipments } from './parts/new-equipments';
import { NewMeetingRooms } from './parts/new-meeting-rooms';
import { EditorRecurrence } from './parts/recurrence';
import { EditorProps } from '../../types/editor';

export const EditorPanel = ({ editorId, expanded }: EditorProps): ReactElement | null =>
	editorId ? (
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
			<EditorDropZone editorId={editorId}>
				<Container style={{ overflowY: 'auto' }} height="fit">
					<EditorOrganizer editorId={editorId} />
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorTitle editorId={editorId} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<EditorLocation editorId={editorId} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<NewMeetingRooms editorId={editorId} />
					</Row>
					<Row height="fit" width="fill" padding={{ top: 'large' }}>
						<NewEquipments editorId={editorId} />
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
			</EditorDropZone>
			<EditorResourcesControllerV2 editorId={editorId} />
		</Container>
	) : null;
