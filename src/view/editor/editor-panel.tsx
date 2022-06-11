/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Divider, Icon, IconButton, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { isNil, map } from 'lodash';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectEditorTitle } from '../../store/selectors/editor';
import { EditorProps } from '../../types/editor';
import { EditorAllDayCheckbox } from './parts/allday-checkbox';
import { EditorAttendees } from './parts/editor-attendees';
import { EditorCalendarSelector } from './parts/editor-calendar-selector';
import { EditorComposer } from './parts/editor-composer';
import { EditorDatePicker } from './parts/editor-date-picker';
import { EditorFreeBusySelector } from './parts/free-busy-selector';
import { EditorLocation } from './parts/location';
import { EditorOrganizer } from './parts/organizer';
import { EditorPrivateCheckbox } from './parts/private-checkbox';
import { EditorTitle } from './parts/title';
import { EditorVirtualRoom } from './parts/virtual-room';

export const EditorPanel = ({ editorId, callbacks }: EditorProps): JSX.Element | null => {
	return editorId && callbacks ? (
		<>
			<EditorOrganizer editorId={editorId} callbacks={callbacks} />
			<EditorTitle editorId={editorId} callbacks={callbacks} />
			<EditorLocation editorId={editorId} callbacks={callbacks} />
			<EditorVirtualRoom editorId={editorId} callbacks={callbacks} />
			<EditorAttendees editorId={editorId} callbacks={callbacks} />
			<EditorFreeBusySelector editorId={editorId} callbacks={callbacks} />
			<EditorCalendarSelector editorId={editorId} callbacks={callbacks} />
			<EditorPrivateCheckbox editorId={editorId} callbacks={callbacks} />
			<EditorDatePicker editorId={editorId} callbacks={callbacks} />
			<EditorAllDayCheckbox editorId={editorId} callbacks={callbacks} />
			{/* <EditorTimezone /> */}
			<EditorComposer editorId={editorId} callbacks={callbacks} />
		</>
	) : null;
};
