/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FOLDERS, getBridgedFunctions } from '@zextras/carbonio-shell-ui';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { PANEL_VIEW } from '../constants';
import { selectAppointment, selectAppointmentInstance } from '../store/selectors/appointments';
import { selectCalendar } from '../store/selectors/calendars';
import { useAppointment, useCalendar, useInstance } from '../store/zustand/hooks';
import { useAppStatusStore } from '../store/zustand/store';
import { PanelView } from '../types/actions';
import { EventActionsEnum } from '../types/enums/event-actions-enum';
import { Appointment, ExceptionReference, InstanceReference } from '../types/store/appointments';
import { Calendar } from '../types/store/calendars';
import { useInvite } from './use-invite';

const openAppointment =
	({
		appointmentId,
		calendarId,
		ridZ,
		panelView
	}: {
		appointmentId: string;
		calendarId: string;
		ridZ?: string | undefined;
		panelView: PanelView;
	}): ((ev: Event) => void) =>
	(ev: Event): void => {
		if (ev) ev.stopPropagation();
		if (panelView === PANEL_VIEW.APP) {
			useAppStatusStore.setState((s) => ({
				...s,
				appointmentId,
				calendarId,
				ridZ,
				action: 'open'
			}));
		}
		if (panelView === PANEL_VIEW.SEARCH) {
			// todo: implement app search store
		}
	};

const openAppointmentItem = ({
	appointmentId,
	calendarId,
	ridZ,
	panelView
}: {
	appointmentId: string;
	calendarId: string;
	ridZ?: string | undefined;
	panelView: PanelView;
}): any => ({
	id: EventActionsEnum.EXPAND,
	icon: 'ExpandOutline',
	disabled: false,
	label: getBridgedFunctions().t('event.action.expand', 'Open in Displayer'),
	keepOpen: true,
	click: openAppointment({
		appointmentId,
		calendarId,
		ridZ,
		panelView
	})
});

const getRecurrentAppointmentActions = ({
	appointment,
	calendar,
	panelView = 'app'
}: {
	appointment: Appointment;
	calendar: Calendar;
	panelView?: PanelView;
}): any => {
	const calendarId = calendar.id;
	const appointmentId = appointment.id;

	if (appointment.isOrg) {
		if (calendarId === FOLDERS.TRASH) {
			return [
				openAppointmentItem({
					appointmentId,
					calendarId,
					panelView
				})
			];
		}
		return [
			openAppointmentItem({
				appointmentId,
				calendarId,
				panelView
			})
		];
	}
	if (calendarId === FOLDERS.TRASH) {
		return [
			openAppointmentItem({
				appointmentId,
				calendarId,
				panelView
			})
		];
	}
	return [
		openAppointmentItem({
			appointmentId,
			calendarId,
			panelView
		})
	];
};

const getAppointmentActions = ({
	appointment,
	calendar,
	instance,
	panelView = 'app'
}: {
	appointment: Appointment;
	calendar: Calendar;
	instance: InstanceReference;
	panelView?: PanelView;
}): any => {
	const calendarId = calendar.id;
	const appointmentId = appointment.id;
	const { ridZ } = instance;

	if (appointment.isOrg) {
		if (calendarId === FOLDERS.TRASH) {
			return [
				openAppointmentItem({
					appointmentId,
					calendarId,
					ridZ,
					panelView
				})
			];
		}
		return [
			openAppointmentItem({
				appointmentId,
				calendarId,
				ridZ,
				panelView
			})
		];
	}
	if (calendarId === FOLDERS.TRASH) {
		return [
			openAppointmentItem({
				appointmentId,
				calendarId,
				ridZ,
				panelView
			})
		];
	}
	return [
		openAppointmentItem({
			appointmentId,
			calendarId,
			ridZ,
			panelView
		})
	];
};

export const useAppointmentActions = (): any => {
	const calendarId = useCalendar();
	const appointmentId = useAppointment();
	const ridZ = useInstance();

	const calendar = useSelector(selectCalendar(calendarId));
	const appointment = useSelector(selectAppointment(appointmentId));
	const instance = useSelector(selectAppointmentInstance(appointmentId, ridZ));

	const inviteId = useMemo(() => {
		if (ridZ) {
			if ((instance as ExceptionReference)?.inviteId) {
				return (instance as ExceptionReference)?.inviteId;
			}
			return appointment?.inviteId;
		}
		return appointment?.inviteId;
	}, [appointment?.inviteId, instance, ridZ]);

	const invite = useInvite(inviteId);

	return useMemo(() => {
		if (!appointment || !calendar || !invite) return [];
		if (appointment?.recur) {
			return getRecurrentAppointmentActions({
				appointment,
				calendar
			});
		}
		if (!instance) return [];
		return getAppointmentActions({
			appointment,
			calendar,
			instance
		});
	}, [appointment, calendar, instance, invite]);
};
