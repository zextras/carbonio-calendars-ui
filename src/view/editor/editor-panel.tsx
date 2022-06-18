/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container } from '@zextras/carbonio-design-system';
import React from 'react';
import { EditorProps } from '../../types/editor';
import { EditorAllDayCheckbox } from './parts/allday-checkbox';
import { EditorActions } from './parts/editor-actions';
import { EditorAttendees } from './parts/editor-attendees';
import { EditorCalendarSelector } from './parts/editor-calendar-selector';
import { EditorComposer } from './parts/editor-composer';
import { EditorDatePicker } from './parts/editor-date-picker';
import { EditorDropZone } from './parts/editor-dropzone';
import { EditorRecurrence } from './parts/editor-recurrence';
import { EditorReminder } from './parts/editor-reminder';
import { EditorFreeBusySelector } from './parts/free-busy-selector';
import { EditorLocation } from './parts/location';
import { EditorOrganizer } from './parts/organizer';
import { EditorPrivateCheckbox } from './parts/private-checkbox';
import { EditorTimezone } from './parts/time-zone';
import { EditorTitle } from './parts/title';
import { EditorVirtualRoom } from './parts/virtual-room';

export const EditorPanel = ({ editorId, callbacks, expanded }: EditorProps): JSX.Element | null =>
	editorId && callbacks ? (
		<Container
			padding={{ horizontal: 'large', bottom: 'large' }}
			mainAlignment="flex-start"
			crossAlignment="flex-start"
		>
			<EditorDropZone editorId={editorId} callbacks={callbacks}>
				<EditorActions editorId={editorId} callbacks={callbacks} />
				<EditorOrganizer editorId={editorId} callbacks={callbacks} expanded={expanded} />
				<EditorTitle editorId={editorId} callbacks={callbacks} />
				<EditorLocation editorId={editorId} callbacks={callbacks} />
				<EditorVirtualRoom editorId={editorId} callbacks={callbacks} />
				<EditorAttendees editorId={editorId} callbacks={callbacks} />
				<EditorFreeBusySelector editorId={editorId} callbacks={callbacks} />
				<EditorCalendarSelector editorId={editorId} callbacks={callbacks} />
				<EditorPrivateCheckbox editorId={editorId} callbacks={callbacks} />
				<EditorDatePicker editorId={editorId} callbacks={callbacks} />
				<EditorTimezone editorId={editorId} callbacks={callbacks} expanded={expanded} />
				<EditorAllDayCheckbox editorId={editorId} callbacks={callbacks} />
				<EditorReminder editorId={editorId} callbacks={callbacks} expanded={expanded} />
				<EditorRecurrence editorId={editorId} callbacks={callbacks} expanded={expanded} />
				<EditorComposer editorId={editorId} callbacks={callbacks} />
			</EditorDropZone>
		</Container>
	) : null;
