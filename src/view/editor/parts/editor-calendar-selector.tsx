/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useUserSettings } from '@zextras/carbonio-shell-ui';
import React from 'react';
import { CALENDAR_PREFS_DEFAULTS } from '../../../constants/defaults';
import { EditorCallbacks } from '../../../types/editor';
import { CalendarSelector } from './calendar-selector';

type EditorCalendarSelectorProps = {
	editorId: string;
	callbacks: EditorCallbacks;
	disabled?: boolean;
};

export const EditorCalendarSelector = ({
	editorId,
	callbacks,
	disabled
}: EditorCalendarSelectorProps): JSX.Element | null => {
	const { onCalendarChange } = callbacks;
	const { zimbraPrefDefaultCalendarId = CALENDAR_PREFS_DEFAULTS.ZIMBRA_PREF_DEFAULT_CALENDAR_ID } =
		useUserSettings().prefs;

	// todo: make calendarSelector an abstract component so it can be reused in the whole app
	return (
		<CalendarSelector
			calendarId={`${zimbraPrefDefaultCalendarId}`}
			onCalendarChange={onCalendarChange}
			disabled={disabled}
		/>
	);
};
