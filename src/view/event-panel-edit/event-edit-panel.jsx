/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useContext, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useReplaceHistoryCallback, Spinner } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Panel from '../../commons/panel';
import EditorController from './editor-controller';
import { useQuickActions } from '../../hooks/use-quick-actions';
import { normalizeCalendarEvent } from '../../normalizations/normalize-calendar-events';
import { selectCalendar } from '../../store/selectors/calendars';
import { selectAppointment, selectAppointmentInstance } from '../../store/selectors/appointments';

export const EventEditPanel = () => {
	const { action, calendarId, apptId, ridZ } = useParams();
	const calendar = useSelector((s) => selectCalendar(s, calendarId));
	const appointment = useSelector((s) => selectAppointment(s, apptId));
	const inst = useSelector((s) => selectAppointmentInstance(s, apptId, ridZ));
	const event = useMemo(() => {
		if (calendar && appointment && inst)
			return normalizeCalendarEvent(calendar, appointment, inst, appointment?.l?.includes(':'));
		return undefined;
	}, [appointment, calendar, inst]);
	const dispatch = useDispatch();
	const replaceHistory = useReplaceHistoryCallback();
	const [t] = useTranslation();
	const actions = useQuickActions(event, { replaceHistory, dispatch }, t);
	const [title, setTitle] = useState(null);

	return event ? (
		<Panel title={title} actions={actions} resizable hideActions>
			<EditorController setTitle={setTitle} action={action} event={event} hideActions />
		</Panel>
	) : (
		<Spinner />
	);
};
