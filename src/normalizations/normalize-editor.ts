/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { filter, isNil, omitBy } from 'lodash';
import moment from 'moment';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { extractHtmlBody, extractBody } from '../commons/body-message-renderer';

export const normalizeEditor = (
	id: string,
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	invite: any,
	selectedStartTime: string,
	selectedEndTime: string,
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	event: any
): any => ({
	title: event.title,
	start: event.start.valueOf(),
	end: event.end.valueOf(),
	startTimeZone: null,
	endTimeZone: null,
	allDay: event.allDay,
	resource: {
		tz: invite?.tz,
		attach: invite.attach,
		attachmentFiles: invite.attachmentFiles,
		parts: invite.parts,
		attendees: filter(
			filter(invite.attendees, (p) => p.cutype !== 'RES'),
			(a) => a.role === 'REQ'
		).map((a) => ({
			email: a.a
		})),
		optionalAttendees: filter(
			filter(invite.attendees, (p) => p.cutype !== 'RES'),
			(a) => a.role === 'OPT'
		).map((a) => ({
			email: a.a
		})),
		alarmString: invite.alarmString ?? 'never',
		alarmValue: invite.alarmValue,
		id,
		idx: 0,
		iAmOrganizer: invite.isOrganizer,
		// can be deleted as we also have it outside resources
		start:
			event.allDay || !invite?.tz
				? {
						d: moment(event.start).utc().format('YYYYMMDD[T]HHmmss[Z]')
				  }
				: {
						d: moment(event.start).format('YYYYMMDD[T]HHmmss'),
						tz: invite?.tz
				  },
		// can be deleted as we also have it outside resources
		end:
			event.allDay || !invite?.tz
				? {
						d: moment(event.end).utc().format('YYYYMMDD[T]HHmmss[Z]')
				  }
				: {
						d: moment(event.start).format('YYYYMMDD[T]HHmmss'),
						tz: invite?.tz
				  },
		calendar: event.resource.calendar,
		status: event.resource.status,
		location: event.resource.location,
		organizer: event.resource.organizer,
		class: event.resource.class,
		inviteNeverSent: event.resource.neverSent,
		hasOtherAttendees: event.resource.hasOtherAttendees,
		hasAlarm: event.resource.alarm,
		fragment: event.resource.fragment,
		isRichText: !!invite.htmlDescription,
		richText: extractHtmlBody(invite.htmlDescription?.[0]._content) ?? '',
		plainText: extractBody(invite.textDescription?.[0]._content) ?? '',
		freeBusy: event.resource.freebusy,
		inviteId: event.resource.inviteId,
		ms: event.resource.ms || undefined,
		rev: event.resource.rev || undefined,
		uid: invite.uid || undefined
	}
});
