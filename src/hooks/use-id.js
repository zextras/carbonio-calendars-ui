/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useUserAccounts } from '@zextras/carbonio-shell-ui';
import { selectCalendars } from '../store/selectors/calendars';
import { selectAppointment, selectAppointmentInstance } from '../store/selectors/appointments';
import { selectInstanceInvite } from '../store/selectors/invites';
import { normalizeEditor } from '../normalizations/normalize-editor';
import { getInvite } from '../store/actions/get-invite';
import { initializeEditorAppointment } from '../store/actions/initialize-editor-appointment';
import { addAppointmentEditor } from '../store/slices/editor-slice';

let counter = 0;

export function getNewEditId(editorId) {
	counter += 1;
	return `${editorId}-${counter}`;
}

export const useId = (
	editorId,
	panel,
	event,
	selectedStartTime = null,
	selectedEndTime = null,
	boardContextInvite = undefined
) => {
	const dispatch = useDispatch();
	const [id, setId] = useState(editorId);
	const calendars = useSelector(selectCalendars);
	const appointment = useSelector((state) => selectAppointment(state, editorId));
	const apptInstance = useSelector((state) =>
		selectAppointmentInstance(state, event?.resource?.id, event?.resource?.ridZ)
	);
	const accounts = useUserAccounts();
	const invite = useSelector((state) =>
		selectInstanceInvite(state, event?.resource?.inviteId, event?.resource?.ridZ)
	);
	useEffect(() => {
		if (!invite && editorId !== 'new') {
			dispatch(getInvite({ inviteId: event?.resource?.inviteId, ridZ: event?.resource?.ridZ }));
		}
	}, [dispatch, editorId, event, invite]);

	useEffect(() => {
		const newId = getNewEditId(editorId);
		if (editorId === 'new') {
			dispatch(
				initializeEditorAppointment({
					id: newId,
					panel,
					calendar: calendars['10'],
					accounts,
					selectedStartTime,
					selectedEndTime
				})
			);
		} else if (event && invite) {
			const eventEditor = normalizeEditor(id, invite, selectedStartTime, selectedEndTime, event);
			dispatch(
				addAppointmentEditor({
					id: newId,
					panel,
					appointment: eventEditor
				})
			);
		} else if (event && boardContextInvite) {
			const eventEditor = normalizeEditor(
				id,
				boardContextInvite,
				selectedStartTime,
				selectedEndTime,
				event
			);
			dispatch(
				addAppointmentEditor({
					id: newId,
					panel,
					appointment: eventEditor
				})
			);
		}
		setId(newId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editorId, invite]);
	const data = useSelector(({ editor }) => editor.editors[id]);
	return { id, data, invite };
};
