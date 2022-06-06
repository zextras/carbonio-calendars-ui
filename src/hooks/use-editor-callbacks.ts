/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useUserAccount } from '@zextras/carbonio-shell-ui';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
	editAppointmentData, editEditorAllDay,
	editEditorAttendees,
	editEditorCalendar,
	editEditorClass,
	editEditorDisplayStatus,
	editEditorLocation,
	editEditorOptionalAttendees,
	editEditorRoom,
	editEditorText,
	editEditorTitle,
	editOrganizer,
} from '../store/slices/editor-slice';
import { EditorCallbacks } from '../types/editor';

export const useEditorCallbacks = (id: string | undefined): EditorCallbacks => {
	const dispatch = useDispatch();
	const account = useUserAccount();

	const onOrganizerChange = useCallback(
		(data) => dispatch(editOrganizer({ id, organizer: data })),
		[dispatch, id]
	);

	const onSubjectChange = useCallback(
		(data) => dispatch(editEditorTitle({ id, title: data.target.value })),
		[dispatch, id]
	);

	const onLocationChange = useCallback(
		(data) => dispatch(editEditorLocation({ id, location: data.target.value })),
		[dispatch, id]
	);

	const onRoomChange = useCallback(
		(room) => dispatch(editEditorRoom({ id, room })),
		[dispatch, id]
	);

	const onAttendeesChange = useCallback(
		(attendees) => dispatch(editEditorAttendees({ id, attendees })),
		[dispatch, id]
	);

	const onOptionalAttendeesChange = useCallback(
		(optionalAttendees) => dispatch(editEditorOptionalAttendees({ id, optionalAttendees })),
		[dispatch, id]
	);

	const onDisplayStatusChange = useCallback(
		(freeBusy) => dispatch(editEditorDisplayStatus({ id, freeBusy })),
		[dispatch, id]
	);

	const onCalendarChange = useCallback(
		(calendar) => {
			const calResource = {
				id: calendar.id,
				name: calendar.name,
				color: calendar.color
			};
			const organizer = {
				email: calendar.owner,
				name: '',
				sentBy: account.name
			};
			const data = {
				id,
				calendar: calResource,
				organizer: calendar.isShared ? organizer : undefined
			};
			dispatch(editEditorCalendar(data));
		},
		[dispatch, id, account]
	);

	const onPrivateChange = useCallback(
		(isPrivate) =>
			dispatch(
				editEditorClass({
					id,
					class: isPrivate ? 'PRI' : 'PUB'
				})
			),
		[dispatch, id]
	);

	const onDateChange = useCallback(
		(mod) => dispatch(editAppointmentData({ id, mod })),
		[dispatch, id]
	);

	const onTextChange = useCallback(
		([plainText, richText]) => dispatch(editEditorText({ id, richText, plainText })),
		[dispatch, id]
	);

	const onAllDayChange = useCallback(
		(allDay, start, end) => dispatch(editEditorAllDay({ id, allDay, start, end })),
		[dispatch, id]
	);

	return {
		onOrganizerChange,
		onSubjectChange,
		onLocationChange,
		onRoomChange,
		onAttendeesChange,
		onOptionalAttendeesChange,
		onDisplayStatusChange,
		onCalendarChange,
		onPrivateChange,
		onDateChange,
		onTextChange,
		onAllDayChange
	};
};
