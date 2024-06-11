/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { addBoard } from '@zextras/carbonio-shell-ui';
import { pick } from 'lodash';
import { Dispatch } from 'redux';

import { Folders } from '../../carbonio-ui-commons/types/folder';
import { generateEditor } from '../../commons/editor-generator';
import { CALENDAR_ROUTE } from '../../constants';
import { Editor } from '../../types/editor';

// todo: enable the possibility to include attachments

type CreateAppointmentContextType = {
	calendar?: Editor['calendar'];
	isRichText?: Editor['isRichText'];
	organizer?: Editor['organizer'];
	sender?: Editor['sender'];
	title?: Editor['title'];
	location?: Editor['location'];
	room?: Editor['room'];
	meetingRoom?: Editor['meetingRoom'];
	equipment?: Editor['equipment'];
	attendees?: Array<{ email: string }>;
	optionalAttendees?: Array<{ email: string }>;
	allDay?: Editor['allDay'];
	freeBusy?: Editor['freeBusy'];
	class?: Editor['class'];
	start?: Editor['start'];
	end?: Editor['end'];
	timezone?: Editor['timezone'];
	reminder?: Editor['reminder'];
	recur?: Editor['recur'];
	richText?: Editor['richText'];
	plainText?: Editor['plainText'];
	disabled?: Editor['disabled'];
};

const createAppointmentIntegration =
	(dispatch: Dispatch, folders: Folders) =>
	(context: CreateAppointmentContextType): void => {
		const contextToApply = pick(context, [
			'calendar',
			'isRichText',
			'organizer',
			'sender',
			'title',
			'location',
			'room',
			'meetingRoom',
			'equipment',
			'attendees',
			'optionalAttendees',
			'allDay',
			'freeBusy',
			'class',
			'start',
			'end',
			'timezone',
			'reminder',
			'recur',
			'richText',
			'plainText',
			'disabled'
		]);
		const editor = generateEditor({
			context: {
				dispatch,
				folders,
				panel: false,
				...contextToApply
			}
		});
		addBoard({
			url: `${CALENDAR_ROUTE}/`,
			title: editor?.title ?? '',
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			editor
		});
	};

export default createAppointmentIntegration;
