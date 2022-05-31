/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useParams } from 'react-router-dom';
import { useBoardConfig } from '@zextras/carbonio-shell-ui';
import { useSelector } from 'react-redux';
import { selectCalendar } from '../../store/selectors/calendars';
import { selectAppointment, selectAppointmentInstance } from '../../store/selectors/appointments';

const useEditorParams = () => {
	const params = useParams();
	const board = useBoardConfig();
	const { calendarId, apptId, ridZ } = board?.proposeNewTime
		? {
				calendarId: board?.event?.resource.calendar.id,
				apptId: board?.event?.resource.id,
				ridZ: board?.event?.resource.ridZ
		  }
		: params;
	return { calendarId, apptId, ridZ };
};

const EditorPanel = ({ boardContext }) => {
	const { calendarId, apptId, ridZ } = useEditorParams();
	const calendar = useSelector((s) => selectCalendar(s, calendarId));
	const appointment = useSelector((s) => selectAppointment(s, apptId));
	const inst = useSelector((s) => selectAppointmentInstance(s, apptId, ridZ));
	return null;
};
export default EditorPanel;
