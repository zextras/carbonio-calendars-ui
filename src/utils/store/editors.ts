/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const initEvent = ({
	id,
	calendar,
	account,
	selectedStartTime,
	selectedEndTime
}: any): any => ({
	title: '',
	start: selectedStartTime ? Number(selectedStartTime) : Date.now(),
	end: selectedEndTime ? Number(selectedEndTime) : Date.now() + 3600,
	startTimeZone: null,
	endTimeZone: null,
	allDay: false,
	resource: {
		attach: { mp: [], aid: [] },
		parts: [],
		attendees: [],
		alarm: '5',
		id,
		idx: 0,
		iAmOrganizer: true,
		start: Date.now(),
		calendar: {
			id: calendar ? calendar.id : null,
			color: calendar ? calendar.color : null,
			name: calendar ? calendar.name : null,
			owner: undefined
		},
		status: 'CONF',
		location: null,
		neverSent: true,
		organizer: {
			name: account.displayName,
			email: account.name,
			sentBy: null
		},
		isPrivate: false,
		class: 'PUB',
		inviteNeverSent: true,
		hasOtherAttendees: false,
		hasAlarm: true,
		fragment: null,
		isRichText: true,
		richText: '',
		plainText: '',
		optionalAttendees: [],
		draft: false
	}
});
