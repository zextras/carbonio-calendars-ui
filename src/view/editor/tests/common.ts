/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { EVENT_DISPLAY_STATUS } from '../../../constants/api';
import { Editor } from '../../../types/editor';

export const defaultEditor: Editor = {
	id: '1',
	title: 'Nuovo appuntamento',
	panel: false,
	isException: false,
	isSeries: false,
	isInstance: true,
	isRichText: true,
	isNew: true,
	attachmentFiles: [],
	sender: { email: 'test@test.com', fullName: 'Test' },
	organizer: { email: 'test@test.com', fullName: 'Test' },
	location: '',
	attendees: [],
	optionalAttendees: [],
	allDay: false,
	freeBusy: EVENT_DISPLAY_STATUS.BUSY,
	class: 'PUB',
	originalStart: 1667834497505,
	originalEnd: 1667834497505,
	start: 1667834497505,
	end: 1667834497505,
	timezone: 'Europe/Berlin',
	reminder: '5',
	richText: '',
	plainText: '',
	compNum: 0,
	disabled: {
		richTextButton: false,
		attachmentsButton: false,
		saveButton: false,
		sendButton: false,
		organizer: false,
		title: false,
		location: false,
		virtualRoom: false,
		attendees: false,
		optionalAttendees: false,
		freeBusySelector: false,
		calendarSelector: false,
		private: false,
		datePicker: false,
		timezone: false,
		allDay: false,
		reminder: false,
		recurrence: false,
		attachments: false,
		composer: false
	}
};
